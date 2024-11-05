import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { CldUploadWidget } from 'next-cloudinary';
import styles from './MediaShare.module.scss';
import ImageModal from './ImageModal';

const MediaShare = ({ documentId }) => {
  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const docRef = doc(db, 'media', documentId);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setMediaUrls(doc.data().urls || []);
      }
    });

    return () => unsubscribe();
  }, [documentId]);

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        setLoading(true);
        setError(null);
        try {
          const file = item.getAsFile();
          if (!file) {
            throw new Error('Failed to get image from clipboard');
          }

          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch('/api/uploadImage', {
            method: 'POST',
            body: formData,
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || data.message || 'Upload failed');
          }
          
          if (!data.secure_url) {
            throw new Error('No secure URL received from server');
          }

          const docRef = doc(db, 'media', documentId);
          const docSnap = await getDoc(docRef);
          const currentUrls = docSnap.exists() ? docSnap.data().urls || [] : [];
          
          await setDoc(docRef, {
            urls: [...currentUrls, data.secure_url]
          }, { merge: true });

        } catch (err) {
          console.error('Paste upload error:', err);
          setError(`Error uploading image: ${err.message}`);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleUploadSuccess = async (result) => {
    try {
      const imageUrl = result.info.secure_url;
      const docRef = doc(db, 'media', documentId);
      const docSnap = await getDoc(docRef);
      const currentUrls = docSnap.exists() ? docSnap.data().urls || [] : [];
      
      await setDoc(docRef, {
        urls: [...currentUrls, imageUrl]
      }, { merge: true });
    } catch (err) {
      setError('Error saving image: ' + err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all images? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      // Delete from Cloudinary
      for (const url of mediaUrls) {
        // Extract public ID from Cloudinary URL
        // Example URL: https://res.cloudinary.com/drkarc7oe/image/upload/v1234567890/folder/image.jpg
        const matches = url.match(/\/v\d+\/(.+)\./);
        if (!matches || !matches[1]) {
          console.error('Could not extract public ID from URL:', url);
          continue;
        }
        const publicId = matches[1];

        const response = await fetch('/api/deleteImage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete image from Cloudinary');
        }
      }

      // Clear Firebase storage
      const docRef = doc(db, 'media', documentId);
      await setDoc(docRef, { urls: [] }, { merge: true });
      
    } catch (err) {
      setError('Error deleting images: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div 
      className={styles.container}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className={styles.header}>
        <h2>Media Sharing</h2>
        {mediaUrls.length > 0 && (
          <button 
            className={styles.deleteButton}
            onClick={handleDeleteAll}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete All Images'}
          </button>
        )}
      </div>

      <div className={styles.imageGrid}>
        {mediaUrls.map((url, index) => (
          <div 
            key={index} 
            className={styles.imageWrapper}
            onClick={() => setSelectedImage(url)}
          >
            <img src={url} alt={`Shared media ${index + 1}`} />
            <div className={styles.imageOverlay}>
              <span>Click to view</span>
            </div>
          </div>
        ))}
      </div>
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
      
      <div className={styles.uploadButtonContainer}>
        <CldUploadWidget
          cloudName="drkarc7oe"
          uploadPreset="syncnote"
          onSuccess={handleUploadSuccess}
          options={{
            maxFiles: 10,
            sources: ['local', 'camera', 'url'],
            resourceType: "image",
            clientAllowedFormats: ["png", "gif", "jpeg", "jpg"],
            maxFileSize: 10000000
          }}
        >
          {({ open }) => (
            <button className={styles.uploadButton} onClick={() => open()}>
              Upload Media
            </button>
          )}
        </CldUploadWidget>
      </div>
      
      {loading && <div className={styles.loading}>Uploading media...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.instructions}>
        You can also paste images directly (Ctrl/Cmd + V)
      </div>
    </div>
  );
};

export default MediaShare; 