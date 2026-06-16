import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { AlertModal, ConfirmModal } from '../../components/ui/Modal/Modal';

export function AdminKnowledgePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string}>({isOpen: false, title: '', message: ''});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', slug: '', category: 'faq', content: '', published: false });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    adminService.getKnowledgeArticles().then((res) => {
      setArticles(res.articles || []);
      setLoading(false);
    });
  };

  const handleEdit = (article: any) => {
    setEditingId(article._id);
    setFormData({
      title: article.title,
      slug: article.slug,
      category: article.category,
      content: article.content,
      published: article.published,
    });
  };

  const handleNew = () => {
    setEditingId('new');
    setFormData({ title: '', slug: '', category: 'faq', content: '', published: false });
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await adminService.createKnowledgeArticle(formData);
      } else if (editingId) {
        await adminService.updateKnowledgeArticle(editingId, formData);
      }
      setEditingId(null);
      loadArticles();
    } catch (err) {
      setAlertConfig({ isOpen: true, title: 'Save Failed', message: 'Failed to save article.' });
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await adminService.deleteKnowledgeArticle(confirmDeleteId);
      setConfirmDeleteId(null);
      loadArticles();
    } catch (err) {
      setAlertConfig({ isOpen: true, title: 'Delete Failed', message: 'Failed to delete article.' });
    }
  };

  if (loading) return <div>Loading Knowledge Base...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Knowledge Base</h1>
        <Button onClick={handleNew}>+ New Article</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card style={{ padding: '0' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ margin: 0 }}>Articles</h3>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {articles.map((a) => (
              <div key={a._id} style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{a.title}</strong>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{a.category} | {a.slug} | {a.published ? 'Published' : 'Draft'}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(a)}>Edit</Button>
                  <Button size="sm" style={{ background: 'var(--color-danger-600)' }} onClick={() => setConfirmDeleteId(a._id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {editingId && (
          <Card style={{ padding: '24px' }}>
            <h2 style={{ marginTop: 0 }}>{editingId === 'new' ? 'Create Article' : 'Edit Article'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              <Input label="Slug (URL)" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Category</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-secondary)' }}
                >
                  <option value="faq">FAQ</option>
                  <option value="ehcp_intro">EHCP Intro</option>
                  <option value="journey_stages">Journey Stages</option>
                  <option value="reminder_templates">Reminder Templates</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Markdown Content</label>
                <textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-secondary)', minHeight: '200px', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} />
                  Published
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                <Button onClick={handleSave}>Save Article</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
      <AlertModal 
        isOpen={alertConfig.isOpen} 
        title={alertConfig.title} 
        message={alertConfig.message} 
        onClose={() => setAlertConfig(prev => ({...prev, isOpen: false}))} 
      />
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Article"
        message="Are you sure you want to delete this article?"
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
