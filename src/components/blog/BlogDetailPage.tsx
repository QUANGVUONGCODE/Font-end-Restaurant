import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Blog {
    id: number;
    title: string;
    content: string;
    thumbnail: string;
    created_at: string;
}

const BlogDetailPage = () => {
    const { id } = useParams();

    const [blog, setBlog] = useState<Blog | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogDetail = async () => {
        const res = await fetch(
            `http://localhost:8080/restaurant/api/v1/blog/${id}`
        );
        const data = await res.json();

        if (data.code === 0) {
            setBlog({
                ...data.result,
                thumbnail: `http://localhost:8080/restaurant/api/v1/blog/images/${data.result.thumbnail}`,
            });
        }
    };

    /* ================= FETCH BLOG IMAGES ================= */
    const fetchBlogImages = async () => {
        const res = await fetch(
            `http://localhost:8080/restaurant/api/v1/blog/imageBlogs/${id}`
        );
        const data = await res.json();

        if (data.code === 0) {
            const imgs = data.result.map(
                (item: any) =>
                    `http://localhost:8080/restaurant/api/v1/blog/images/${item.url}`
            );
            setImages(imgs);
        }
    };

    useEffect(() => {
        Promise.all([fetchBlogDetail(), fetchBlogImages()]).finally(() =>
            setLoading(false)
        );
    }, [id]);

    if (loading) {
        return <div className="text-center py-20">Đang tải bài viết...</div>;
    }

    if (!blog) {
        return <div className="text-center py-20">Không tìm thấy bài viết</div>;
    }

    return (
        <div className="bg-white">
            {/* ================= HERO ================= */}
            <div className="relative h-[520px]">
                <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-wide">
                        {blog.title}
                    </h1>
                    <p className="mt-3 text-sm tracking-widest uppercase text-amber-300">
                        {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                    </p>
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* ===== MAIN CONTENT ===== */}
                <div className="lg:col-span-2">
                    <p className="text-lg leading-8 text-gray-700">
                        {blog.content}
                    </p>

                    {/* ===== GALLERY ===== */}
                    {images.length > 0 && (
                        <div className="mt-16 space-y-10">
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Blog image ${index + 1}`}
                                    className="w-full rounded-xl shadow-lg"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== SIDEBAR ===== */}
                <aside className="space-y-10">
                    {/* ABOUT */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">
                            About us
                        </h3>
                        <p className="text-gray-600 leading-7 text-sm">
                            Sesan Restaurant mang đến trải nghiệm ẩm thực cao cấp,
                            không gian sang trọng cùng dịch vụ tận tâm.
                        </p>
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">
                            Chuyên mục
                        </h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li>Khuyến mãi (3)</li>
                            <li>Uncategorized @vi (4)</li>
                        </ul>
                    </div>

                    {/* GALLERY MINI */}
                    {images.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold tracking-widest uppercase mb-4">
                                Thư viện hình ảnh
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {images.slice(0, 6).map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        className="w-full h-20 object-cover rounded"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default BlogDetailPage;
