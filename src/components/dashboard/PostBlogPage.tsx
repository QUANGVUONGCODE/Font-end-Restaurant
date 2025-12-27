import React, { useMemo, useState } from 'react';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Image as ImageIcon, UploadCloud, X, Loader2, FileText } from 'lucide-react';

const AddBlog: React.FC = () => {
  const [blogData, setBlogData] = useState({
    title: '',
    content: '',
    thumbnail: [] as File[],
  });

  const [loading, setLoading] = useState(false);

  // Preview URLs
  const previewUrls = useMemo(() => {
    return blogData.thumbnail.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      key: `${file.name}-${file.size}-${file.lastModified}`,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogData.thumbnail]);

  // Validate file size (optional)
  const checkFileSize = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`Ảnh "${file.name}" quá lớn (tối đa 5MB)`);
      return false;
    }
    return true;
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({ ...prev, [name]: value }));
  };

  // Add images
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const selected = Array.from(event.target.files).filter(checkFileSize);

    // tránh trùng ảnh theo (name+size+lastModified)
    const existed = new Set(
      blogData.thumbnail.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
    );

    const merged = [
      ...blogData.thumbnail,
      ...selected.filter((f) => !existed.has(`${f.name}-${f.size}-${f.lastModified}`)),
    ];

    setBlogData((prev) => ({ ...prev, thumbnail: merged }));

    // reset input để chọn lại cùng file vẫn trigger change
    event.target.value = '';
  };

  // Remove one image
  const removeImage = (key: string) => {
    setBlogData((prev) => ({
      ...prev,
      thumbnail: prev.thumbnail.filter((f) => `${f.name}-${f.size}-${f.lastModified}` !== key),
    }));
  };

  // Clear all
  const resetForm = () => {
    setBlogData({ title: '', content: '', thumbnail: [] });
  };

  // Upload images
  const handleUploadImages = async (blogId: number) => {
    if (blogData.thumbnail.length === 0) return;

    const token = await checkAndRefreshToken();
    if (!token) return;

    const formData = new FormData();
    blogData.thumbnail.forEach((image) => formData.append('files', image));

    const response = await fetch(`http://localhost:8080/restaurant/api/v1/blog/upload/${blogId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to upload images');

    const result = await response.json();
    if (result.code === 0) {
      toast.success('✅ Upload ảnh thành công!');
    } else {
      toast.error('❌ Upload ảnh thất bại');
    }
  };

  // Create blog
  const handleAddBlog = async () => {
    const title = blogData.title.trim();
    const content = blogData.content.trim();

    if (!title || !content) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    setLoading(true);

    const token = await checkAndRefreshToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create blog
      const response = await fetch('http://localhost:8080/restaurant/api/v1/blog', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) throw new Error('Failed to create blog');

      const blog = await response.json();

      if (blog.code === 0 && blog.result?.id) {
        toast.success('✅ Tạo bài viết thành công!');

        // Step 2: Upload images
        if (blogData.thumbnail.length > 0) {
          await handleUploadImages(blog.result.id);
        }

        // done
        resetForm();
      } else {
        toast.error('❌ Tạo bài viết thất bại');
      }
    } catch (error) {
      console.error(error);
      toast.error('❌ Có lỗi xảy ra khi thêm bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 md:p-8 ml-64">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Thêm Bài Viết</h2>
          <p className="text-sm text-gray-600">Tạo bài viết mới và upload thumbnail</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white flex items-center justify-between">
            <div className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tạo bài viết mới
            </div>
            <div className="text-sm text-white/90">
              {blogData.thumbnail.length} ảnh đã chọn
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={blogData.title}
                  onChange={handleInputChange}
                  className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Nội dung</label>
                <textarea
                  name="content"
                  value={blogData.content}
                  onChange={handleInputChange}
                  className="mt-2 w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Nhập nội dung bài viết..."
                  rows={10}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                  disabled={loading}
                >
                  Xóa form
                </button>

                <button
                  type="button"
                  onClick={handleAddBlog}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tạo...
                    </span>
                  ) : (
                    'Tạo bài viết'
                  )}
                </button>
              </div>
            </div>

            {/* Right - Upload + Preview */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Upload hình ảnh</div>
                    <p className="text-sm text-gray-600">
                      Chọn nhiều ảnh nếu cần (khuyến nghị &lt; 5MB/ảnh).
                    </p>

                    <div className="mt-4">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        multiple
                        className="block w-full text-sm text-gray-700
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-xl file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700
                          cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview grid */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-900">Preview ảnh</div>
                  <div className="text-sm text-gray-600">
                    {blogData.thumbnail.length === 0 ? 'Chưa chọn ảnh' : ''}
                  </div>
                </div>

                {blogData.thumbnail.length === 0 ? (
                  <div className="h-40 rounded-xl bg-gray-50 border border-dashed flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                      Chưa có ảnh nào
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {previewUrls.map(({ url, key, file }) => (
                      <div key={key} className="relative group">
                        <img
                          src={url}
                          alt={file.name}
                          className="w-full h-28 object-cover rounded-xl border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(key)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                          title="Xóa ảnh"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="mt-1 text-[11px] text-gray-600 line-clamp-1">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="text-xs text-gray-500">
                * Lưu ý: Bạn đang upload nhiều ảnh. Nếu backend chỉ lưu 1 thumbnail, bạn nên chỉ chọn 1 ảnh.
              </div>
            </div>
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default AddBlog;
