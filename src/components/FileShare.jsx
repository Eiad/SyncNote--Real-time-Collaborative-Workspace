import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { CldUploadWidget } from 'next-cloudinary';
import styles from './FileShare.module.scss';
import { useAuth } from '@/contexts/AuthContext';
import { FiUpload, FiTrash2, FiFileText } from 'react-icons/fi';

const FileShare = ({ documentId }) => {
    const { user } = useAuth();
    const [fileData, setFileData] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;

        const docRef = doc(db, `users/${user.uid}/files`, documentId);

        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setFileData(doc.data().files || []);
            }
        });

        return () => unsubscribe();
    }, [documentId, user]);

    const handleUploadSuccess = async (result) => {
        const fileUrl = result.info.secure_url;
        const uploadDate = new Date().toLocaleString();
        const docRef = doc(db, `users/${user.uid}/files`, documentId);

        try {
            const docSnap = await getDoc(docRef);
            const currentFiles = docSnap.exists() ? docSnap.data().files || [] : [];

            const newFileData = { url: fileUrl, date: uploadDate };
            await setDoc(docRef, {
                files: [...currentFiles, newFileData]
            }, { merge: true });
        } catch (err) {
            setError('Error saving file: ' + err.message);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete all files? This cannot be undone.')) {
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            const docRef = doc(db, `users/${user.uid}/files`, documentId);
            await setDoc(docRef, { files: [] }, { merge: true });
        } catch (err) {
            setError('Error deleting files: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            {user?.displayName === 'Ash' && (
                <div className={styles.container}>
                    <div className={styles.header}>                        
                        {fileData.length > 0 && (
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


                    <CldUploadWidget
                        cloudName="drkarc7oe"
                        uploadPreset="syncnote"
                        onSuccess={handleUploadSuccess}
                        options={{
                            maxFiles: 10,
                            resourceType: "raw",
                            clientAllowedFormats: ["zip", "pdf", "doc", "docx", "xls", "xlsx"],
                            maxFileSize: 10000000,
                            multiple: true,
                            showCompletedButton: true,
                        }}
                    >
                        {({ open }) => (
                            <button className={styles.uploadButton} onClick={() => open()}>
                                <FiUpload className={styles.buttonIcon} />
                                Upload Files
                            </button>
                        )}
                    </CldUploadWidget>


                    <div className={styles.fileGrid}>
                        {fileData.map((file, index) => (
                            <div key={index} className={styles.fileItem}>
                                <div className={styles.fileTitle}>
                                    <FiFileText className={styles.fileIcon} />
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                        {file.url.split('/').pop()}
                                    </a>
                                </div>
                                <div className={styles.fileDetails}>
                                    <span className={styles.uploadDate}>{file.date}</span>
                                    <a href={file.url} download className={styles.downloadButton}>
                                        Download
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                </div>
            )}
        </>
    );
};

export default FileShare;