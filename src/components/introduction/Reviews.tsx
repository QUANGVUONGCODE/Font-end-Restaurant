import React, { useEffect, useState } from "react";
import { checkAndRefreshToken } from "../../utils/TokenManager";
import { getUserId } from "../../utils/user";

/* ================== INTERFACES ================== */
interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Comment {
  id: number;
  content: string;
  star: number;
  created_at: string;
  user: User;
}

const CustomerReviews = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [starFilter, setStarFilter] = useState<number | "">("");
  const [page, setPage] = useState<number>(0);
  const [totalPage, setTotalPage] = useState<number>(1);

  // ===== POST comment state =====
  const [postStar, setPostStar] = useState<number>(5);
  const [postContent, setPostContent] = useState<string>("");
  const [posting, setPosting] = useState<boolean>(false);

  const limit = 5;

  /* ================== FETCH COMMENTS ================== */
  const fetchComments = async () => {
    setLoading(true);
    try {
      const query = `star=${starFilter}&limit=${limit}&page=${page}`;
      const res = await fetch(
        `http://localhost:8080/restaurant/api/v1/comment?${query}`,
        { headers: { "Accept-Language": "vi" } }
      );

      const data = await res.json();

      if (data.code === 0) {
        setComments(data.result.comments || []);
        setTotalPage(data.result.totalPage || 1);
      } else {
        setComments([]);
        setTotalPage(1);
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      setComments([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starFilter, page]);

  /* ================== POST COMMENT ================== */
  const handlePostComment = async () => {
    const content = postContent.trim();
    if (!content) {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }
    if (!postStar || postStar < 1 || postStar > 5) {
      alert("Vui lòng chọn số sao (1-5)!");
      return;
    }

    setPosting(true);
    try {
      const token = await checkAndRefreshToken();
      const userId = getUserId();
      if (!token) {
        alert("Bạn cần đăng nhập để đánh giá!");
        return;
      }

      // ✅ Đổi endpoint này nếu backend bạn khác
      const res = await fetch("http://localhost:8080/restaurant/api/v1/comment", {
        method: "POST",
        headers: {
          "Accept-Language": "vi",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          star: postStar,
          user_id: userId,
        }),
      });

      const data = await res.json();

      if (data.code === 0) {
        setPostContent("");
        setPostStar(5);

        // về trang 0 để thấy comment mới (hoặc giữ nguyên tùy bạn)
        setPage(0);
        await fetchComments();
      } else {
        alert("Gửi đánh giá thất bại!");
      }
    } catch (err) {
      console.error("Post comment error:", err);
      alert("Có lỗi khi gửi đánh giá!");
    } finally {
      setPosting(false);
    }
  };

  /* ================== UI ================== */
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* HEADER */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Khách Hàng Nói Gì Về Chúng Tôi
        </h2>
        <p className="text-gray-600 mt-2">
          Những đánh giá chân thật từ khách hàng đã trải nghiệm
        </p>
      </div>

      {/* ===== POST COMMENT BOX ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Viết đánh giá</h3>
            <p className="text-sm text-gray-500">
              Chia sẻ trải nghiệm của bạn để giúp mọi người lựa chọn tốt hơn.
            </p>
          </div>

          {/* chọn sao */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Số sao:</span>
            <select
              value={postStar}
              onChange={(e) => setPostStar(Number(e.target.value))}
              className="border rounded-xl px-4 py-2 bg-white"
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              <option value={4}>⭐⭐⭐⭐ (4)</option>
              <option value={3}>⭐⭐⭐ (3)</option>
              <option value={2}>⭐⭐ (2)</option>
              <option value={1}>⭐ (1)</option>
            </select>
          </div>
        </div>

        {/* content */}
        <div className="mt-4">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Nhập đánh giá của bạn..."
            className="w-full min-h-[110px] border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handlePostComment}
            disabled={posting}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {posting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <select
            value={starFilter}
            onChange={(e) =>
              setStarFilter(e.target.value ? Number(e.target.value) : "")
            }
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Tất cả</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
            <option value="4">⭐⭐⭐⭐ (4 sao)</option>
            <option value="3">⭐⭐⭐ (3 sao)</option>
            <option value="2">⭐⭐ (2 sao)</option>
            <option value="1">⭐ (1 sao)</option>
          </select>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p className="text-center text-gray-500">Đang tải đánh giá...</p>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-500">Chưa có đánh giá nào</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
            >
              {/* USER */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{c.user.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                {/* STAR */}
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < c.star ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>

              {/* CONTENT */}
              <p className="text-gray-700 leading-relaxed">“{c.content}”</p>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPage > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            ← Trước
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Trang {page + 1} / {totalPage}
          </span>

          <button
            disabled={page + 1 >= totalPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Sau →
          </button>
        </div>
      )}
    </section>
  );
};

export default CustomerReviews;
