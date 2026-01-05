import React, { useState } from 'react';
import axios from 'axios';

const BannerSection = ({ onRefresh }) => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // នៅពេលរើសរូបភាព
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile)); // បង្ហាញរូបភាពបណ្តោះអាសន្ន
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert("សូមជ្រើសរើសរូបភាព Banner!");

        setLoading(true);

        // បង្កើត FormData ដើម្បីផ្ញើ File ទៅ Server
        const formData = new FormData();
        formData.append('type', 'banner');
        formData.append('title', title);
        formData.append('images', file); // 'images' ត្រូវតែដូចឈ្មោះក្នុង upload.array('images') នៅ Server

        try {
            const response = await axios.post('https://two4-store.onrender.com/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert("រក្សាទុក Banner ជោគជ័យ!");
                setTitle('');
                setFile(null);
                setPreview(null);
                if (onRefresh) onRefresh(); // ឱ្យវាទាញទិន្នន័យថ្មីមកបង្ហាញ
            }
        } catch (error) {
            console.error("Upload Error:", error.response?.data || error.message);
            alert("មានបញ្ហាពេល Upload: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>បន្ថែម Banner ថ្មី</h3>
            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>ចំណងជើង Banner:</label><br/>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                        placeholder="ឧទាហរណ៍៖ បញ្ចុះតម្លៃពិសេស ៥០%"
                        required
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>រើសរូបភាព Banner:</label><br/>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ marginTop: '5px' }}
                        required
                    />
                </div>

                {preview && (
                    <div style={{ marginBottom: '10px' }}>
                        <p>រូបភាព Preview:</p>
                        <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '5px' }} />
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '10px 20px', 
                        backgroundColor: loading ? '#ccc' : '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក Banner'}
                </button>
            </form>
        </div>
    );
};

export default BannerSection;