import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Image as ImageIcon, Link, Download, FileImage, Plus, ZoomIn } from "lucide-react";
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

const ImageUpload = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);    
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);                                                                               
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageForView, setSelectedImageForView] = useState<UploadedImage | null>(null);
  const [allUploadedImages, setAllUploadedImages] = useState<UploadedImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // Debug logging
  console.log('ImageUpload - currentUser:', currentUser?.email);
  console.log('ImageUpload - userProfile:', userProfile);
  console.log('ImageUpload - role:', userProfile?.role);

  // Keyboard shortcut for file selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load all uploaded images from Firebase Storage
  const loadAllUploadedImages = async () => {
    if (!storage) return;
    
    setLoadingImages(true);
    try {
      const listRef = ref(storage, 'product-images');
      const result = await listAll(listRef);
      
      const imagePromises = result.items.map(async (itemRef) => {
        try {
          const url = await getDownloadURL(itemRef);
          return {
            id: itemRef.name,
            name: itemRef.name,
            url: url,
            size: 0, // Size not available from listAll
            uploadedAt: new Date() // Date not available from listAll
          };
        } catch (error) {
          console.error('Error getting download URL for', itemRef.name, error);
          return null;
        }
      });

      const images = (await Promise.all(imagePromises)).filter(Boolean) as UploadedImage[];
      setAllUploadedImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Error",
        description: "Failed to load uploaded images",
        variant: "destructive",
      });
    } finally {
      setLoadingImages(false);
    }
  };

  // Load images on component mount
  useEffect(() => {
    loadAllUploadedImages();
  }, []);

  // Check if user is admin or superadmin
  if (!currentUser || (userProfile?.role !== 'admin' && userProfile?.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You need admin privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {    
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUpload(Array.from(files));
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // Show preview before uploading
      setPreviewFiles(imageFiles);
      // Auto-upload after showing preview
      setTimeout(() => {
        handleUpload(imageFiles);
        setPreviewFiles([]);
      }, 1000);
    } else {
      toast({
        title: "Invalid Files",
        description: "Please drop only image files (JPG, PNG, GIF, WebP)",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setUploadProgress({});
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);    
        }

        // Create a unique filename
        const timestamp = Date.now() + index;
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `product-images/${fileName}`);

        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update progress to 100%
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        return {
          id: timestamp.toString(),
          name: file.name,
          url: downloadURL,
          size: file.size,
          uploadedAt: new Date()
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...uploadedFiles, ...prev]);
      
      // Reload all images to include the new uploads
      loadAllUploadedImages();

      toast({
        title: "Upload Successful",
        description: `${files.length} image(s) uploaded successfully`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload images",                                                                        
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Product Image Upload
            </h1>
            <p className="text-muted-foreground">
              Upload product images and get URLs for use in your product listings
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Images
              </CardTitle>
              <CardDescription>
                Drag and drop images here or click to select. Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB per image.                                              
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Drag and Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    isDragOver
                      ? 'border-primary bg-primary/5 scale-105'
                      : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-4">
                    {isDragOver ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Plus className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-primary">Drop images here!</p>
                          <p className="text-sm text-muted-foreground">Release to upload</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <FileImage className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">Drag & drop images here</p>
                          <p className="text-sm text-muted-foreground">or click to browse files</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Browse Files'}
                  </Button>

                  {uploading && (
                    <Badge variant="secondary" className="animate-pulse">       
                      Uploading...
                    </Badge>
                  )}
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      Processing images...
                    </div>
                  </div>
                )}

                {/* Drag and Drop Tips */}
                <div className="text-center text-xs text-muted-foreground space-y-1">
                  <p>💡 <strong>Tip:</strong> You can drag multiple images at once for bulk upload</p>
                  <p>⌨️ <strong>Shortcut:</strong> Press Ctrl+O (or Cmd+O on Mac) to open file browser</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {previewFiles.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Preview ({previewFiles.length} files)
                </CardTitle>
                <CardDescription>
                  Files ready for upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {previewFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs">Uploading...</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      {uploadProgress[file.name] !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                          <div 
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          ></div>
                        </div>
                      )}
                      <div className="p-2 bg-background">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Uploaded Images Gallery */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    All Uploaded Images ({allUploadedImages.length})
                  </CardTitle>
                  <CardDescription>
                    Click on any image to view full size and copy its URL
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAllUploadedImages}
                  disabled={loadingImages}
                >
                  {loadingImages ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingImages ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-muted-foreground">Loading images...</span>
                </div>
              ) : allUploadedImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">                                                           
                  {allUploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-lg ${                             
                        selectedImage?.id === image.id ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'                                           
                      }`}
                      onClick={() => {
                        setSelectedImage(image);
                        setSelectedImageForView(image);
                        setShowImageViewer(true);
                      }}
                    >
                      <div className="aspect-square bg-muted flex items-center justify-center">                                                                 
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden text-muted-foreground text-xs text-center p-2">
                          {image.name}
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">      
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageForView(image);
                            setShowImageViewer(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <ZoomIn className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="p-2 bg-background">
                        <p className="text-xs font-medium truncate">{image.name}</p>                                                                            
                        <p className="text-xs text-muted-foreground">
                          {formatDate(image.uploadedAt)}                                                                       
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No images uploaded yet</h3>
                  <p className="text-muted-foreground">Upload your first image using the drag & drop area above</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image Viewer Dialog */}
          <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
            <DialogContent className="max-w-5xl max-h-[95vh] p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {selectedImageForView?.name}
                </DialogTitle>
              </DialogHeader>
              
              {selectedImageForView && (
                <div className="relative p-6 pt-4">
                  <img
                    src={selectedImageForView.url}
                    alt={selectedImageForView.name}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
