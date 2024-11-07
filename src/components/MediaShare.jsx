import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { CldUploadWidget } from 'next-cloudinary';
import styles from './MediaShare.module.scss';
import ImageModal from './ImageModal';
import { useAuth } from '@/contexts/AuthContext';
import { FiImage, FiTrash2 } from 'react-icons/fi';

const MediaShare = ({ documentId }) => {
  const { user } = useAuth();
  const [mediaUrls, setMediaUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pasteLoading, setPasteLoading] = useState(false);

  const handlePaste = useCallback(async (event) => {
    const items = event.clipboardData?.items;
    if (!items || !user) return;

    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (!file) continue;

        setPasteLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/api/uploadImage', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload pasted image');
          }

          const data = await response.json();
          const imageUrl = data.secure_url;

          const docRef = doc(db, `users/${user.uid}/media`, documentId);
          const docSnap = await getDoc(docRef);
          const currentUrls = docSnap.exists() ? docSnap.data().urls || [] : [];

          await setDoc(docRef, {
            urls: [...currentUrls, imageUrl]
          }, { merge: true });
        } catch (err) {
          setError('Error uploading pasted image: ' + err.message);
        } finally {
          setPasteLoading(false);
        }
      }
    }
  }, [user, documentId]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  useEffect(() => {
    if (!user) return;
    
    const docRef = doc(db, `users/${user.uid}/media`, documentId);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setMediaUrls(doc.data().urls || []);
      }
    });

    return () => unsubscribe();
  }, [documentId, user]);

  const handleUploadSuccess = async (result) => {
    try {
      const imageUrl = result.info.secure_url;
      const docRef = doc(db, `users/${user.uid}/media`, documentId);
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
      const docRef = doc(db, `users/${user.uid}/media`, documentId);
      await setDoc(docRef, { urls: [] }, { merge: true });
      
    } catch (err) {
      setError('Error deleting images: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Media Sharing</h2>
        {mediaUrls.length > 0 && (
          <button 
            className={styles.deleteButton}
            onClick={handleDeleteAll}
            disabled={deleting}
          >
            <FiTrash2 className={styles.buttonIcon} />
            {deleting ? 'Deleting...' : 'Clear'}
          </button>
        )}
      </div>

      {pasteLoading && (
        <div className={styles.loading}>
          Uploading image...
        </div>
      )}

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
            maxFileSize: 10000000,
            cropping: false,
            multiple: true,
            showAdvancedOptions: false,
            showCompletedButton: true,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
              }
            }
          }}
        >
          {({ open }) => (
            <button className={styles.uploadButton} onClick={() => open()}>
              <FiImage className={styles.buttonIcon} />
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