import { useCallback } from 'react';
import axios from 'axios';

const getApiUrl = (endpoint) => {
    const protocol = process.env.REACT_APP_SERVER_PROTOCOL;
    const baseUrl = process.env.REACT_APP_SERVER_BASE_URL;
    const port = process.env.REACT_APP_SERVER_PORT;

    if (!protocol || !baseUrl || !port) {
        throw new Error('Missing required environment variables');
    }

    return `${protocol}${baseUrl}${port}${endpoint}`;
};

export const useActivityHandlers = ({ showModal, closeModal, setSecurityAlert }) => {
    
    const handleViewImage = useCallback(async (activity) => {
        if (!activity?.id) {
            setSecurityAlert('ไม่พบข้อมูลกิจกรรม');
            return;
        }

        try {
            const response = await axios.get(
                getApiUrl(`/api/teacher/activity-registration-image/${activity.id}`),
                { withCredentials: true }
            );

            if (response.data?.status && response.data?.data?.imageFile) {
                const imageUrl = getApiUrl(`/api/admin/images/registration-images/${response.data.data.imageFile}`);
                
                // Preload image with credentials
                const img = new Image();
                img.crossOrigin = 'use-credentials';
                
                img.onload = () => {
                    showModal(
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '16px', color: '#374151' }}>รูปภาพเข้าร่วมกิจกรรม</h3>
                            <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>{activity.title}</p>
                            <img 
                                src={imageUrl} 
                                alt="รูปภาพเข้าร่วมกิจกรรม"
                                crossOrigin="use-credentials"
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '500px', 
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }} 
                            />
                        </div>,
                        [
                            {
                                label: 'ดาวน์โหลด',
                                onClick: async () => {
                                    try {
                                        const downloadResponse = await axios.get(imageUrl, {
                                            responseType: 'blob',
                                            withCredentials: true
                                        });
                                        const blob = new Blob([downloadResponse.data]);
                                        const link = document.createElement('a');
                                        link.href = window.URL.createObjectURL(blob);
                                        link.download = `activity_image_${activity.id}_${Date.now()}.jpg`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(link.href);
                                    } catch (err) {
                                        console.error('Download error:', err);
                                        alert('เกิดข้อผิดพลาดในการดาวน์โหลด');
                                    }
                                }
                            },
                            {
                                label: 'ปิด',
                                onClick: closeModal
                            }
                        ]
                    );
                };

                img.onerror = () => {
                    showModal('ไม่สามารถโหลดรูปภาพได้', [
                        { label: 'ตกลง', onClick: closeModal }
                    ]);
                };

                img.src = imageUrl;
            } else {
                showModal('ไม่พบรูปภาพการเข้าร่วมกิจกรรม', [
                    { label: 'ตกลง', onClick: closeModal }
                ]);
            }
        } catch (error) {
            console.error('Error fetching registration image:', error);
            const errorMsg = error.response?.status === 404 
                ? 'ไม่พบรูปภาพการเข้าร่วมที่ได้รับการอนุมัติ' 
                : 'เกิดข้อผิดพลาดในการดึงรูปภาพ';
            showModal(errorMsg, [
                { label: 'ตกลง', onClick: closeModal }
            ]);
        }
    }, [showModal, closeModal, setSecurityAlert]);

    const handleViewCertificate = useCallback(async (activity) => {
        if (!activity?.id) {
            setSecurityAlert('ไม่พบข้อมูลกิจกรรม');
            return;
        }

        try {
            const response = await axios.get(
                getApiUrl(`/api/admin/teacher/activity-certificate/${activity.id}`),
                { withCredentials: true }
            );

            if (response.data?.status && response.data?.data?.Certificate_ImageFile) {
                const certUrl = getApiUrl(`/api/admin/images/certificate-real-files/${response.data.data.Certificate_ImageFile}`);
                
                // Preload certificate image with credentials
                const img = new Image();
                img.crossOrigin = 'use-credentials';
                
                img.onload = () => {
                    showModal(
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '16px', color: '#374151' }}>เกียรติบัตร</h3>
                            <p style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>{activity.title}</p>
                            <img 
                                src={certUrl} 
                                alt="เกียรติบัตร"
                                crossOrigin="use-credentials"
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '600px', 
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }} 
                            />
                        </div>,
                        [
                            {
                                label: 'ดาวน์โหลด',
                                onClick: async () => {
                                    try {
                                        const downloadResponse = await axios.get(certUrl, {
                                            responseType: 'blob',
                                            withCredentials: true
                                        });
                                        const blob = new Blob([downloadResponse.data]);
                                        const link = document.createElement('a');
                                        link.href = window.URL.createObjectURL(blob);
                                        link.download = `certificate_${activity.id}_${Date.now()}.png`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(link.href);
                                    } catch (err) {
                                        console.error('Download error:', err);
                                        alert('เกิดข้อผิดพลาดในการดาวน์โหลด');
                                    }
                                }
                            },
                            {
                                label: 'ปิด',
                                onClick: closeModal
                            }
                        ]
                    );
                };

                img.onerror = () => {
                    showModal('ไม่สามารถโหลดเกียรติบัตรได้', [
                        { label: 'ตกลง', onClick: closeModal }
                    ]);
                };

                img.src = certUrl;
            } else {
                showModal('ไม่พบเกียรติบัตร หรือยังไม่ได้สร้างเกียรติบัตร', [
                    { label: 'ตกลง', onClick: closeModal }
                ]);
            }
        } catch (error) {
            console.error('Error fetching certificate:', error);
            const errorMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงเกียรติบัตร';
            showModal(errorMsg, [
                { label: 'ตกลง', onClick: closeModal }
            ]);
        }
    }, [showModal, closeModal, setSecurityAlert]);

    return {
        handleViewImage,
        handleViewCertificate
    };
};