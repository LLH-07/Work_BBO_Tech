# Agentic AI Navigator — bản tái cấu trúc theo lĩnh vực

Bản này đã được thiết kế lại để tránh chồng chất nội dung trong một trang dài. Nội dung được gom theo cụm và tách thành các trang dạng thư mục:

- `/` — trang chủ tổng quan.
- `/tong-quan/` — nền tảng, thị trường, Việt Nam, quản trị, lộ trình.
- `/linh-vuc/` — chọn lĩnh vực.
- `/linh-vuc/ke-toan/` — kế toán & tài chính.
- `/linh-vuc/san-xuat/` — sản xuất.
- `/linh-vuc/logistics/` — logistics & chuỗi cung ứng.
- `/linh-vuc/phap-ly/` — pháp lý & tuân thủ.
- `/ngach/` — top 5, 4 ngách B2B, 12 ngách ưu tiên và 40 ngách mở rộng.
- `/nghe-nghiep/` — 15 nghề mới và nhóm nghề biến đổi.
- `/thuat-ngu/` — glossary.
- `/upload/` — upload tài liệu mới để phân loại cục bộ.
- `/nguon/` — nguồn tham khảo và file gốc.

## Chạy local

```bash
python -m pip install -r requirements.txt
python server.py
```

Mở trình duyệt tại:

```text
http://127.0.0.1:8000
```

## Ghi chú thiết kế

Các file cũ được giữ trong `originals/` và text trích xuất nằm trong `data/raw_texts/`. 4 file mới được bổ sung vào cùng cấu trúc, đồng thời nội dung chính đã được đưa vào các trang lĩnh vực để đọc sâu hơn.


## Cập nhật nguồn 2025–2026

Bản này đã bổ sung `AgenticAI_BaoCao_ChienLuoc_2025.pdf` vào thư mục `originals/`, thêm bản text trích xuất vào `data/raw_texts/`, cập nhật trang Nguồn và tích hợp các số liệu/nỗi đau/giải pháp/ngách mới vào 4 trang lĩnh vực.
