// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to Your App</h1>
        <p className="text-xl text-muted-foreground mb-8">Your app is now running successfully!</p>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <p className="text-card-foreground">✅ App is working correctly</p>
          <p className="text-sm text-muted-foreground mt-2">The preview should be visible now</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
