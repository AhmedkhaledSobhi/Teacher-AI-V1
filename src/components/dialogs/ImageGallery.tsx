import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
} from "@mui/material";

interface ImageGalleryProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onImageChange: (index: number) => void;
  title?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  open,
  onClose,
  images,
  currentIndex,
  onImageChange,
  title = "Image Gallery",
}) => {
  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onImageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onImageChange(newIndex);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      handlePrevious();
    } else if (event.key === "ArrowRight") {
      handleNext();
    } else if (event.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          color: "white",
          maxHeight: "90vh",
          margin: 2,
        },
      }}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 2,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography variant="h6" component="div">
          {title} ({currentIndex + 1} of {images.length})
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }} size="large">
          ✕
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: 0,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
            size="large"
          >
            ‹
          </IconButton>
        )}

        {/* Main Image */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            padding: 2,
          }}
        >
          <img
            src={currentImage}
            alt={`Gallery image ${currentIndex + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const errorDiv = document.createElement("div");
              errorDiv.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 200px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-size: 16px;
              `;
              errorDiv.textContent = "Failed to load image";
              target.parentNode?.appendChild(errorDiv);
            }}
          />
        </Box>

        {/* Next Button */}
        {images.length > 1 && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
            }}
            size="large"
          >
            ›
          </IconButton>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              padding: 1,
              borderRadius: 2,
              maxWidth: "80%",
              overflowX: "auto",
            }}
          >
            {images.map((image, index) => (
              <Box
                key={index}
                onClick={() => onImageChange(index)}
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 1,
                  overflow: "hidden",
                  cursor: "pointer",
                  border:
                    currentIndex === index
                      ? "2px solid white"
                      : "2px solid transparent",
                  opacity: currentIndex === index ? 1 : 0.7,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    opacity: 1,
                    transform: "scale(1.05)",
                  },
                }}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageGallery;
