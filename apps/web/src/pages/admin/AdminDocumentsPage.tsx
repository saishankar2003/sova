import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { AlertModal } from '../../components/ui/Modal/Modal';

export function AdminDocumentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string}>({isOpen: false, title: '', message: ''});

  useEffect(() => {
    adminService.getDocuments().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleDownload = async (docId: string) => {
    try {
      const { downloadUrl } = await adminService.downloadDocument(docId);
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        setAlertConfig({ isOpen: true, title: 'Download Failed', message: 'Download URL not available.' });
      }
    } catch (err) {
      setAlertConfig({ isOpen: true, title: 'Download Failed', message: 'Failed to get download link.' });
    }
  };

  if (loading) return <div>Loading documents...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Global Documents Audit</h1>
      <Card style={{ padding: '0' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 24px' }}>File Name</th>
                <th style={{ padding: '12px 24px' }}>User</th>
                <th style={{ padding: '12px 24px' }}>Size</th>
                <th style={{ padding: '12px 24px' }}>Uploaded</th>
                <th style={{ padding: '12px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.documents?.map((doc: any) => (
                <tr key={doc._id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td style={{ padding: '12px 24px', fontWeight: '500' }}>{doc.originalName}</td>
                  <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{doc.userId?.email || 'Unknown User'}</td>
                  <td style={{ padding: '12px 24px' }}>{Math.round(doc.sizeBytes / 1024)} KB</td>
                  <td style={{ padding: '12px 24px' }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 24px' }}>
                    <Button size="sm" variant="secondary" onClick={() => handleDownload(doc._id)}>
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <AlertModal 
        isOpen={alertConfig.isOpen} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        onClose={() => setAlertConfig(prev => ({...prev, isOpen: false}))} 
      />
    </div>
  );
}
