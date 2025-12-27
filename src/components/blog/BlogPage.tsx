import React, { useEffect, useState } from "react";
import { useNavigation } from "../../utils/navagation";

interface Blog {
    id: number;
    title: string;
    content: string;
    thumbnail: string;
    created_at: string;
}

const BlogPage = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const { goToBlogDetail } = useNavigation();

    const fetchBlogs = async () => {
        try {
            const res = await fetch(
                "http://localhost:8080/restaurant/api/v1/blog",
                {
                    headers: { "Accept-Language": "vi" },
                }
            );
            const data = await res.json();
            if (data.code === 0) {
                setBlogs(data.result);
            }
        } catch (err) {
            console.error("Fetch blog error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* ================= LEFT CONTENT ================= */}
                <div className="lg:col-span-8 space-y-16">
                    {loading && <p>Đang tải bài viết...</p>}

                    {!loading &&
                        blogs.map((blog) => (
                            <article key={blog.id} className="space-y-6">
                                {/* Title */}
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {blog.title}
                                </h2>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>
                                        {new Date(blog.created_at).toLocaleDateString("vi-VN")}
                                    </span>
                                    <span className="text-orange-500 font-medium uppercase tracking-wide cursor-pointer"
                                        onClick={() => goToBlogDetail(blog.id)}
                                    >
                                        Đọc thêm
                                    </span>
                                </div>

                                {/* Image */}
                                <img
                                    src={`http://localhost:8080/restaurant/api/v1/blog/images/${blog.thumbnail}`}
                                    alt={blog.title}
                                    className="w-full h-[420px] object-cover rounded"
                                />

                                {/* Content */}
                                <p className="text-gray-700 leading-8">
                                    {blog.content}
                                </p>

                                <div className="border-b pt-6" />
                            </article>
                        ))}
                </div>

                {/* ================= SIDEBAR ================= */}
                <aside className="lg:col-span-4 space-y-12">
                    {/* ABOUT */}
                    <div>
                        <h3 className="text-sm font-bold tracking-widest mb-4">
                            ABOUT US
                        </h3>
                        <p className="text-gray-600 leading-7 text-sm">
                            Lấy tiêu chí “SỰ LỰA CHỌN ĐẲNG CẤP” và nụ cười hài lòng của khách hàng là phương châm hoạt động của chúng tôi.

                            Chúng tôi mang tinh hoa ẩm thực cùng phong cách phục vụ chuyên nghiệp, tạo nên những trải nghiệm đáng nhớ cho từng thực khách.
                        </p>
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <h3 className="text-sm font-bold tracking-widest mb-4">
                            CHUYÊN MỤC
                        </h3>
                        <ul className="space-y-3 text-gray-700 text-sm">
                            <li className="flex justify-between border-b pb-2">
                                <span>Khuyến mãi</span>
                                <span>(3)</span>
                            </li>
                            <li className="flex justify-between border-b pb-2">
                                <span>Uncategorized</span>
                                <span>(4)</span>
                            </li>
                        </ul>
                    </div>

                    {/* GALLERY */}
                    <div>
                        <h3 className="text-sm font-bold tracking-widest mb-4">
                            GALLERY ON FLICKR
                        </h3>

                        <div className="grid grid-cols-3 gap-3">
                            {blogs.slice(0, 6).map((b) => (
                                <img
                                    key={b.id}
                                    src={`http://localhost:8080/restaurant/api/v1/blog/images/${b.thumbnail}`}
                                    alt="gallery"
                                    className="w-full h-20 object-cover rounded"
                                />
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BlogPage;
