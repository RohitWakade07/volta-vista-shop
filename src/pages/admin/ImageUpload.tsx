import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Copy, Check, X, Image as ImageIcon, Link, Download } from "lucide-react";
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Debug logging
  console.log('ImageUpload - currentUser:', currentUser?.email);
  console.log('ImageUpload - userProfile:', userProfile);
  console.log('ImageUpload - role:', userProfile?.role);

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

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `product-images/${fileName}`);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "Copied to Clipboard",
        description: "Image URL copied successfully",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive"
      });
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
                Select multiple images to upload. Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB per image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload" className="sr-only">
                    Choose images
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Choose Images'}
                  </Button>
                  
                  {uploading && (
                    <Badge variant="secondary" className="animate-pulse">
                      Uploading...
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Images Grid */}
          {uploadedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Uploaded Images ({uploadedImages.length})
                </CardTitle>
                <CardDescription>
                  Click on any image to view details and copy its URL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                        selectedImage?.id === image.id ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(image.url);
                          }}
                          className="flex items-center gap-2"
                        >
                          {copiedUrl === image.url ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copiedUrl === image.url ? 'Copied!' : 'Copy URL'}
                        </Button>
                      </div>
                      
                      <div className="p-2 bg-background">
                        <p className="text-sm font-medium truncate">{image.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(image.size)} • {formatDate(image.uploadedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Details Modal */}
          {selectedImage && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Image Details
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium">File Name</Label>
                      <p className="text-sm text-muted-foreground">{selectedImage.name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">File Size</Label>
                      <p className="text-sm text-muted-foreground">{formatFileSize(selectedImage.size)}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Uploaded At</Label>
                      <p className="text-sm text-muted-foreground">{formatDate(selectedImage.uploadedAt)}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Image URL</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Textarea
                          value={selectedImage.url}
                          readOnly
                          className="flex-1 min-h-[60px] text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(selectedImage.url)}
                          className="flex items-center gap-2"
                        >
                          {copiedUrl === selectedImage.url ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(selectedImage.url)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy URL
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedImage.url, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Link className="h-4 w-4" />
                      Open in New Tab
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
