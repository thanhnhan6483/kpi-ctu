**ĐẠI HỌC CẦN THƠ**
**TÀI LIỆU PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG**
**PHẦN MỀM QUẢN LÝ VÀ ĐÁNH GIÁ KPIs THEO MÔ HÌNH MBO**

Phiên bản: 1.0
Phạm vi: Thiết kế tổng thể, phân tích nghiệp vụ, dữ liệu, phân quyền, báo cáo và kiến trúc triển khai
Đối tượng áp dụng: Ban Giám hiệu, phòng ban, khoa/viện/trường, bộ môn/chuyên ngành, giảng viên và viên chức




**Cần Thơ, 2026**

# Bảng kiểm soát tài liệu

# Mục lục tóm tắt
Tổng quan hệ thống và phạm vi
Actor và vai trò người dùng
Quy trình nghiệp vụ MBO
Danh mục module chức năng
Use case tổng quát và chi tiết
Công thức tính điểm KPI và xếp loại
Quản lý minh chứng và phê duyệt
Thiết kế dữ liệu và ERD mô tả
Ma trận phân quyền
Sitemap và giao diện
Báo cáo, dashboard, tích hợp hệ thống
Kiến trúc kỹ thuật, yêu cầu phi chức năng, lộ trình triển khai và rủi ro
# 1. Tổng quan hệ thống
Hệ thống phần mềm quản lý và đánh giá KPIs theo MBO được thiết kế nhằm số hóa toàn bộ chu trình thiết lập mục tiêu, phân rã chỉ tiêu, đăng ký kế hoạch, theo dõi tiến độ, nộp minh chứng, tự đánh giá, cấp trên đánh giá, hội đồng rà soát và tổng hợp kết quả. Hệ thống phục vụ quản trị hiệu quả hoạt động trong bối cảnh đại học công lập đa ngành, nhiều đơn vị trực thuộc, nhiều nhóm nhân sự và nhiều loại chỉ tiêu khác nhau.
## 1.1. Mục tiêu nghiệp vụ
Liên kết mục tiêu chiến lược cấp trường với KPI đơn vị và KPI cá nhân.
Chuẩn hóa bộ chỉ số đánh giá theo từng nhóm: Ban Giám hiệu, phòng ban, khoa/viện/trường, bộ môn/chuyên ngành, giảng viên và viên chức.
Bảo đảm 70-80% điểm KPI là chỉ số định lượng, có đơn vị đo, ngưỡng đạt và minh chứng rõ ràng.
Tích hợp KPI chuyển đổi số: tỷ lệ hồ sơ xử lý trên hệ thống, số hóa quy trình, sử dụng LMS, tự đào tạo kỹ năng số.
Tự động hóa tính điểm, miễn giảm giờ giảng, xếp loại và báo cáo phục vụ lương tăng thêm, khen thưởng, quy hoạch nhân sự.
## 1.2. Phạm vi hệ thống

# 2. Actor và vai trò người dùng

# 3. Cấu trúc KPI theo cấp
## 3.1. Bản đồ trọng số KPI

## 3.2. Danh mục KPI lõi

# 4. Quy trình nghiệp vụ MBO
Quy trình được thiết kế theo hướng từ trên xuống, nhưng có phản hồi hai chiều giữa cá nhân, đơn vị và cấp trường. Mỗi mục tiêu phải rõ ràng, đo lường được, có thời hạn, có minh chứng và được cấp có thẩm quyền phê duyệt.

# 5. Danh mục module chức năng

# 6. Use case tổng quát

# 7. Use case chi tiết tiêu biểu
## 7.1. UC05 - Đăng ký KPI cá nhân

## 7.2. UC09 - Đánh giá cấp trên

# 8. Công thức tính điểm KPI
Hệ thống cần hỗ trợ cấu hình công thức tính điểm linh hoạt theo từng chỉ số. Công thức mặc định đề xuất như sau:

## 8.1. Mức xếp loại

# 9. Chính sách miễn giảm giờ giảng

# 10. Quy trình quản lý minh chứng

## 10.1. Loại minh chứng

# 11. Thiết kế dữ liệu
Mô hình dữ liệu được thiết kế theo hướng cấu hình linh hoạt, tách rõ danh mục KPI, kế hoạch KPI, tiến độ thực hiện, minh chứng, đánh giá và điểm số. Các bảng dưới đây là nhóm bảng lõi cần có trong phiên bản đầu tiên.

## 11.1. ERD mô tả dạng chữ
Users thuộc OrganizationalUnits, có nhiều Roles thông qua UserRoles. KPI_Cycles thuộc AcademicYears. KPI_Templates gồm nhiều KPI_TemplateItems, mỗi item tham chiếu KPI_Indicators. KPI_Plans thuộc một chu kỳ và một chủ thể đánh giá. KPI_Plans có nhiều KPI_PlanItems. Mỗi KPI_PlanItem có nhiều KPI_Progress, KPI_Evidences và một KPI_Scores. KPI_Evaluations đánh giá một KPI_Plans bởi evaluator. TeachingWorkloads và WorkloadReductions hỗ trợ tính KPI giờ giảng. ResearchOutputs, CommunityServices và DigitalTransformationMetrics có thể đồng bộ tự động hoặc nhập tay để làm dữ liệu nguồn cho KPI.
# 12. Ma trận phân quyền

# 13. Sitemap hệ thống

# 14. Mô tả giao diện chính

# 15. Báo cáo và dashboard

# 16. Tích hợp hệ thống

# 17. Kiến trúc kỹ thuật đề xuất

# 18. Yêu cầu phi chức năng

# 19. Lộ trình triển khai

# 20. Rủi ro và giải pháp kiểm soát

# 21. Kết luận
Phần mềm quản lý và đánh giá KPIs theo MBO cho Đại học Cần Thơ cần được xem là nền tảng quản trị hiệu suất và cải tiến chất lượng, không chỉ là công cụ chấm điểm cuối năm. Hệ thống phải bảo đảm liên thông mục tiêu từ cấp trường đến cá nhân, tăng tỷ lệ đánh giá dựa trên dữ liệu định lượng, chuẩn hóa minh chứng, tích hợp chuyển đổi số và hỗ trợ ra quyết định trong lương tăng thêm, khen thưởng, quy hoạch, đào tạo và cải tiến chất lượng.

| Thông tin | Nội dung |
| --- | --- |
| Tên tài liệu | Tài liệu phân tích và thiết kế phần mềm quản lý, đánh giá KPIs theo MBO |
| Đơn vị sử dụng | Đại học Cần Thơ và các đơn vị trực thuộc |
| Mục tiêu | Quản lý vòng đời KPI từ chiến lược cấp trường đến kế hoạch cá nhân, đánh giá, minh chứng, xếp loại và báo cáo |
| Phương pháp quản trị | MBO - Management by Objectives, kết hợp Balanced Scorecard và quản trị chất lượng giáo dục đại học |
| Nguồn yêu cầu | Nội dung yêu cầu nghiệp vụ do người dùng cung cấp trong file đính kèm |


| Phạm vi | Mô tả |
| --- | --- |
| Trong phạm vi | Quản lý KPI, kế hoạch, tiến độ, minh chứng, đánh giá, phê duyệt, báo cáo, tích hợp dữ liệu và phân quyền. |
| Ngoài phạm vi | Không thay thế hệ thống đào tạo, LMS, nhân sự, tài chính, NCKH; chỉ tích hợp để lấy dữ liệu phục vụ đánh giá. |
| Đơn vị áp dụng | Cấp trường, phòng ban chức năng, khoa/viện/trường, bộ môn/chuyên ngành, cá nhân giảng viên/viên chức. |
| Chu kỳ áp dụng | Năm học, học kỳ, quý/tháng hoặc chu kỳ đặc thù do nhà trường cấu hình. |


| Actor | Vai trò chính |
| --- | --- |
| Ban Giám hiệu | Xem dashboard chiến lược, giao mục tiêu cấp trường, phê duyệt kết quả tổng hợp, xem cảnh báo đơn vị chưa đạt. |
| Hội đồng đánh giá KPIs | Rà soát minh chứng, chuẩn hóa điểm, xử lý kiến nghị/khiếu nại, khóa kết quả cuối kỳ. |
| Phòng Tổ chức cán bộ | Quản lý hồ sơ nhân sự, chức vụ, miễn giảm, kết quả xếp loại, lương tăng thêm, khen thưởng. |
| Phòng Đảm bảo chất lượng | Quản lý bộ chỉ số, chuẩn hóa tiêu chí, khảo sát, kiểm tra minh chứng và báo cáo cải tiến. |
| Phòng Đào tạo | Cung cấp dữ liệu giờ giảng, lớp học, nộp điểm, CTĐT, chuẩn đầu ra, tốt nghiệp. |
| Phòng Khoa học công nghệ | Cung cấp dữ liệu đề tài, công bố, chuyển giao, sở hữu trí tuệ. |
| Phòng CNTT | Quản trị kỹ thuật, tích hợp, tài khoản, bảo mật, sao lưu, dashboard. |
| Trưởng đơn vị | Giao KPI, duyệt kế hoạch, theo dõi tiến độ, đánh giá cấp dưới, xuất báo cáo đơn vị. |
| Bộ môn/Chuyên ngành | Lập kế hoạch chuyên môn, phân công giảng dạy, theo dõi KPI học thuật và người học. |
| Giảng viên/Viên chức | Đăng ký KPI cá nhân, cập nhật tiến độ, nộp minh chứng, tự đánh giá, xem kết quả. |
| Quản trị hệ thống | Cấu hình danh mục, phân quyền, chu kỳ, công thức, biểu mẫu, nhật ký và sao lưu. |


| Nhóm đối tượng | Nhóm KPI và trọng số đề xuất |
| --- | --- |
| Ban Giám hiệu | Đào tạo 50%; NCKH 30%; Phục vụ cộng đồng và đối ngoại 20%. |
| Phòng ban chức năng | Khối lượng và hiệu suất 50%; Chất lượng công việc/SLA 30%; Quản lý và nhân sự 20%. |
| Khoa/Viện/Trường | Quản lý đào tạo 50%; NCKH của đơn vị 30%; Phục vụ và văn hóa khoa 20%. |
| Bộ môn/Chuyên ngành | Quản lý giảng dạy 35%; NCKH và ĐMST 25%; Phục vụ người học 15%; Đóng góp tập thể 15%; Phát triển năng lực 10%. |
| Giảng viên/Viên chức | Giảng dạy và hỗ trợ người học 35-40%; NCKH 25-30%; Phục vụ 10-15%; Đóng góp tập thể 10-15%; Phát triển cá nhân 5-10%. |


| Cấp | KPI lõi | Đơn vị đo | Minh chứng chính |
| --- | --- | --- | --- |
| BGH | Tỷ lệ CTĐT được rà soát/cập nhật; tỷ lệ tốt nghiệp đúng hạn; việc làm sau tốt nghiệp; số công bố Scopus/WoS; doanh thu chuyển giao. | %, bài, VNĐ | Quyết định, báo cáo đào tạo, khảo sát, DOI, hợp đồng. |
| Phòng ban | Số hồ sơ đúng hạn; thời gian xử lý trung bình; SLA; mức hài lòng; tỷ lệ hồ sơ số hóa. | Hồ sơ, ngày, %, điểm/5 | Log ticket, email, báo cáo tháng, khảo sát. |
| Khoa/Viện/Trường | Đề cương cập nhật; lớp có LMS; SV đạt chuẩn đầu ra; công bố, đề tài, sản phẩm chuyển giao. | %, bài, đề tài, sản phẩm | LMS, đề cương, dữ liệu đào tạo, quyết định, DOI. |
| Bộ môn/Chuyên ngành | Phân công học phần đúng kế hoạch; rubric/ngân hàng đề; seminar; hoạt động hướng nghiệp. | %, số lượng | Kế hoạch, biên bản, học liệu, danh sách tham dự. |
| Giảng viên | Giờ chuẩn; đánh giá SV; nộp điểm đúng hạn; công bố/đề tài; phục vụ cộng đồng; giờ tự đào tạo số. | Giờ, điểm/5, %, bài, giờ | TKB, LMS, hệ thống điểm, DOI, thư mời, chứng chỉ. |


| Bước | Tên bước | Mô tả | Đầu ra |
| --- | --- | --- | --- |
| 1 | Định hướng chiến lược | BGH xác định ưu tiên phát triển năm học. | Mục tiêu chiến lược cấp trường. |
| 2 | Mục tiêu chất lượng năm học | Chuyển hóa chiến lược thành chỉ tiêu đào tạo, NCKH, phục vụ, chuyển đổi số. | Bộ chỉ tiêu trọng yếu. |
| 3 | Phân rã mục tiêu | Giao mục tiêu cho phòng ban, khoa, viện, trường. | KPI cấp đơn vị. |
| 4 | Kế hoạch đơn vị | Đơn vị lập kế hoạch, phân bổ nguồn lực, đăng ký chỉ tiêu. | Kế hoạch KPI đơn vị. |
| 5 | Kế hoạch cá nhân | Cán bộ, giảng viên đăng ký KPI cá nhân. | Phiếu KPI cá nhân. |
| 6 | Phê duyệt | Cấp trên trực tiếp phê duyệt hoặc yêu cầu chỉnh sửa. | KPI đã cam kết. |
| 7 | Theo dõi tiến độ | Cập nhật kết quả theo tháng/quý/học kỳ. | Dashboard tiến độ. |
| 8 | Tự đánh giá | Cá nhân/đơn vị nhập kết quả và nộp minh chứng. | Báo cáo tự đánh giá. |
| 9 | Đánh giá cấp trên | Cấp trên xem xét, trao đổi, chấm điểm. | Biên bản đánh giá. |
| 10 | Hội đồng rà soát | Chuẩn hóa điểm, xử lý chênh lệch và khiếu nại. | Kết quả chính thức. |
| 11 | Tổng hợp và sử dụng | Xuất báo cáo phục vụ lương, thưởng, quy hoạch, cải tiến. | Bảng xếp loại và báo cáo. |
| 12 | Khởi tạo chu kỳ mới | Sao chép cấu hình, điều chỉnh chỉ tiêu cho năm sau. | Chu kỳ KPI mới. |


| Mã | Module | Chức năng chính |
| --- | --- | --- |
| M01 | Quản trị hệ thống | Người dùng, vai trò, phân quyền, cơ cấu tổ chức, năm học, chu kỳ KPI, danh mục chức vụ, thang điểm. |
| M02 | Quản lý bộ KPI | Tạo KPI mẫu, nhóm KPI, chỉ số, trọng số, công thức, đơn vị đo, ngưỡng đạt, loại minh chứng, phê duyệt bộ KPI. |
| M03 | Lập kế hoạch KPI | Giao mục tiêu, đăng ký KPI cấp đơn vị/cá nhân, điều chỉnh, phê duyệt, ký cam kết điện tử. |
| M04 | Theo dõi tiến độ | Cập nhật tiến độ, dashboard, cảnh báo chậm tiến độ, thiếu minh chứng, sắp đến hạn. |
| M05 | Quản lý minh chứng | Tải lên, liên kết KPI, kiểm tra, yêu cầu bổ sung, phê duyệt, lưu trữ và truy vết. |
| M06 | Đánh giá KPI | Tự đánh giá, cấp trên đánh giá, 360 độ, hội đồng rà soát, khóa kết quả. |
| M07 | Tính điểm và xếp loại | Tính theo trọng số, ngưỡng, hệ số miễn giảm, xếp loại tự động. |
| M08 | Báo cáo và dashboard | Báo cáo cá nhân, đơn vị, toàn trường; xuất Excel/PDF/Word; biểu đồ, heatmap. |
| M09 | Tích hợp hệ thống | LMS, đào tạo, văn bản, nhân sự, tài chính, NCKH, ticket, email, chữ ký số, SSO. |
| M10 | Thông báo và nhắc việc | Email, thông báo trong hệ thống, nhắc hạn, nhắc thiếu minh chứng, thông báo kết quả. |


| Mã UC | Tên use case | Actor chính | Mô tả |
| --- | --- | --- | --- |
| UC01 | Đăng nhập/SSO | Tất cả người dùng | Người dùng truy cập bằng tài khoản nội bộ/SSO, hệ thống xác định vai trò và đơn vị. |
| UC02 | Cấu hình chu kỳ KPI | Quản trị, Phòng TCCB | Tạo năm học, học kỳ, thời hạn đăng ký, tự đánh giá, đánh giá và khóa kết quả. |
| UC03 | Tạo bộ KPI mẫu | QA, TCCB, BGH | Tạo nhóm KPI, chỉ số, trọng số, công thức và minh chứng bắt buộc. |
| UC04 | Giao KPI cho đơn vị | BGH, Trưởng đơn vị | Phân rã mục tiêu cấp trường xuống từng đơn vị. |
| UC05 | Đăng ký KPI cá nhân | Giảng viên/Viên chức | Chọn chỉ số phù hợp, nhập chỉ tiêu, kế hoạch hành động, minh chứng dự kiến. |
| UC06 | Phê duyệt kế hoạch KPI | Cấp trên trực tiếp | Duyệt, trả về chỉnh sửa hoặc từ chối kế hoạch. |
| UC07 | Cập nhật tiến độ | Cá nhân/Đơn vị | Cập nhật kết quả thực hiện, đính kèm minh chứng, ghi chú khó khăn. |
| UC08 | Tự đánh giá | Cá nhân/Đơn vị | Nhập kết quả cuối kỳ, hệ thống tính điểm đề xuất. |
| UC09 | Đánh giá cấp trên | Trưởng đơn vị/BGH | Xem minh chứng, chấm điểm, phản hồi, thống nhất kết quả. |
| UC10 | Rà soát hội đồng | Hội đồng đánh giá | Chuẩn hóa điểm, xử lý bất thường, khóa kết quả. |
| UC11 | Tính lương tăng thêm/khen thưởng | TCCB, Tài chính, BGH | Kết xuất danh sách xếp loại và hệ số phục vụ chế độ chính sách. |
| UC12 | Báo cáo dashboard | BGH, đơn vị, cá nhân | Theo dõi tiến độ, so sánh đơn vị, phân tích KPI theo nhóm. |


| Mục | Nội dung |
| --- | --- |
| Actor | Giảng viên/Viên chức; cấp trên trực tiếp là actor phụ. |
| Tiền điều kiện | Chu kỳ KPI mở; người dùng đã có tài khoản và thuộc một đơn vị; bộ KPI mẫu đã được phê duyệt. |
| Luồng chính | 1) Người dùng chọn chu kỳ KPI. 2) Hệ thống gợi ý bộ KPI theo vai trò. 3) Người dùng nhập chỉ tiêu, kế hoạch hành động, minh chứng dự kiến. 4) Hệ thống kiểm tra tổng trọng số. 5) Người dùng gửi phê duyệt. 6) Cấp trên nhận thông báo. |
| Luồng ngoại lệ | Trọng số không đủ 100%; thiếu KPI bắt buộc chuyển đổi số; chỉ tiêu vượt ngưỡng cấu hình; hết hạn đăng ký. |
| Đầu ra | Phiếu KPI cá nhân trạng thái Chờ phê duyệt. |


| Mục | Nội dung |
| --- | --- |
| Actor | Trưởng đơn vị/Trưởng bộ môn/BGH theo phân quyền. |
| Tiền điều kiện | Cá nhân/đơn vị đã tự đánh giá và nộp minh chứng. |
| Luồng chính | 1) Cấp trên mở danh sách hồ sơ. 2) Xem điểm hệ thống đề xuất. 3) Kiểm tra minh chứng. 4) Chấm điểm hoặc điều chỉnh có lý do. 5) Gửi phản hồi. 6) Tổ chức trao đổi trực tiếp nếu có chênh lệch. 7) Gửi hội đồng rà soát. |
| Luồng ngoại lệ | Minh chứng không hợp lệ; dữ liệu tích hợp chưa đồng bộ; cá nhân khiếu nại điểm đánh giá. |
| Đầu ra | Điểm đánh giá cấp trên và biên bản phản hồi. |


| Thành phần | Công thức/Mô tả |
| --- | --- |
| Tỷ lệ hoàn thành | CompletionRate = ActualValue / TargetValue x 100%. Với KPI càng thấp càng tốt, dùng TargetValue / ActualValue x 100%. |
| Điểm chỉ số | IndicatorScore = min(CompletionRate, CapRate) x MaxPoint / 100. CapRate mặc định 120% để tránh vượt điểm quá lớn. |
| Điểm nhóm KPI | GroupScore = Tổng(IndicatorScore x IndicatorWeight trong nhóm). |
| Điểm tổng | TotalScore = Tổng(GroupScore x GroupWeight). |
| Điểm có minh chứng | Nếu thiếu minh chứng bắt buộc: IndicatorScore = 0 hoặc chuyển trạng thái Chưa đủ điều kiện đánh giá. |
| Điểm sau miễn giảm giờ giảng | TeachingScore tính trên giờ chuẩn còn lại sau miễn giảm, không tính trên giờ chuẩn gốc. |


| Mức | Khoảng điểm | Ý nghĩa |
| --- | --- | --- |
| Xuất sắc | 90-100 | Vượt mục tiêu, có tác động rõ, đủ minh chứng. |
| Tốt | 80-89 | Hoàn thành tốt, ổn định. |
| Đạt | 65-79 | Hoàn thành cơ bản, cần cải tiến một số điểm. |
| Cần cải thiện | 50-64 | Thiếu hụt đáng kể, cần kế hoạch hỗ trợ. |
| Không đạt | < 50 | Không hoàn thành nhiệm vụ hoặc thiếu minh chứng quan trọng. |


| Chức vụ/kiêm nhiệm | Tỷ lệ miễn giảm | Ghi chú |
| --- | --- | --- |
| Hiệu trưởng/Giám đốc đại học | 85-90% | Tập trung quản trị chiến lược và đối ngoại. |
| Phó Hiệu trưởng/Phó Giám đốc | 75-85% | Theo mảng phụ trách. |
| Trưởng khoa/Viện trưởng/Trưởng phòng lớn | 70-85% | Có KPI quản trị đơn vị thay thế giờ giảng. |
| Phó Trưởng khoa/Phó Viện trưởng/Phó Trưởng phòng | 50-70% | Tùy quy mô đơn vị. |
| Trưởng bộ môn/Trưởng ngành/Trưởng CTĐT | 50-60% | Gắn với KPI quản lý chương trình và học thuật. |
| Phó Trưởng bộ môn/Thư ký chương trình | 30-40% | Áp dụng khi có nhiệm vụ thực chất. |
| Cố vấn học tập quy mô lớn | 10-20% | Theo số lượng sinh viên phụ trách. |
| Chủ nhiệm đề tài/dự án trọng điểm | 10-30% | Theo cấp đề tài, giá trị, sản phẩm cam kết. |


| Trạng thái | Mô tả | Người xử lý |
| --- | --- | --- |
| Chưa nộp | KPI yêu cầu minh chứng nhưng người dùng chưa tải lên/liên kết dữ liệu. | Cá nhân/đơn vị |
| Đã nộp | Minh chứng đã được tải lên, chờ kiểm tra. | Cá nhân/đơn vị |
| Cần bổ sung | Minh chứng thiếu, sai định dạng, chưa đủ căn cứ. | Cấp trên/QA |
| Hợp lệ | Minh chứng phù hợp với KPI, có thể dùng để tính điểm. | Cấp trên/QA |
| Không hợp lệ | Minh chứng không liên quan, không xác thực hoặc trùng lặp. | Cấp trên/QA/Hội đồng |
| Đã khóa | Minh chứng đã được chấp nhận trong kết quả cuối kỳ, không chỉnh sửa. | Hội đồng/Quản trị |


| Loại minh chứng | Ví dụ | Nguồn |
| --- | --- | --- |
| Tệp đính kèm | PDF, Word, Excel, hình ảnh, biên bản, quyết định. | Người dùng tải lên. |
| Đường dẫn | DOI bài báo, trang công bố, thư mục minh chứng. | Người dùng nhập URL. |
| Log hệ thống | LMS, hệ thống điểm, ticket, DMS, ERP. | Tích hợp tự động. |
| Khảo sát | Đánh giá SV, hài lòng dịch vụ, 360 độ. | Hệ thống khảo sát. |
| Email xác nhận | Thư mời, xác nhận nhiệm vụ, xác nhận hoàn thành. | Email nội bộ. |


| Bảng | Mục đích | Trường chính | Khóa/quan hệ |
| --- | --- | --- | --- |
| Users | Người dùng hệ thống | user_id, username, full_name, email, employee_code, unit_id, status | PK user_id; FK unit_id |
| Roles | Vai trò | role_id, role_name, description | PK role_id |
| Permissions | Quyền chức năng | permission_id, code, name, module | PK permission_id |
| UserRoles | Gán vai trò | user_id, role_id, scope_unit_id | PK user_id+role_id; FK Users, Roles |
| OrganizationalUnits | Cơ cấu tổ chức | unit_id, parent_id, unit_name, unit_type, status | PK unit_id; FK parent_id |
| Positions | Chức vụ | position_id, name, reduction_rate_min, reduction_rate_max | PK position_id |
| AcademicYears | Năm học | academic_year_id, name, start_date, end_date | PK academic_year_id |
| KPI_Cycles | Chu kỳ KPI | cycle_id, academic_year_id, name, start_date, end_date, status | PK cycle_id; FK AcademicYears |
| KPI_Groups | Nhóm KPI | group_id, name, default_weight, target_level | PK group_id |
| KPI_Indicators | Chỉ số KPI | indicator_id, group_id, name, unit, direction, formula, required_evidence | PK indicator_id; FK KPI_Groups |
| KPI_Templates | Bộ KPI mẫu | template_id, name, target_role, target_level, status | PK template_id |
| KPI_TemplateItems | Chỉ số trong mẫu | template_id, indicator_id, weight, target_value, cap_rate | PK template_id+indicator_id |
| KPI_Plans | Kế hoạch KPI | plan_id, cycle_id, owner_type, owner_id, status, submitted_at, approved_at | PK plan_id |
| KPI_PlanItems | Chỉ tiêu trong kế hoạch | plan_item_id, plan_id, indicator_id, target_value, weight, due_date | PK plan_item_id; FK plan_id, indicator_id |
| KPI_Progress | Tiến độ | progress_id, plan_item_id, actual_value, progress_date, note | PK progress_id; FK plan_item_id |
| KPI_Evidences | Minh chứng | evidence_id, plan_item_id, evidence_type, file_url, external_url, status, reviewer_note | PK evidence_id; FK plan_item_id |
| KPI_Evaluations | Đánh giá | evaluation_id, plan_id, evaluator_id, evaluation_type, score, comment, status | PK evaluation_id; FK plan_id, evaluator_id |
| KPI_Scores | Điểm KPI | score_id, plan_item_id, self_score, manager_score, council_score, final_score | PK score_id; FK plan_item_id |
| KPI_Approvals | Phê duyệt | approval_id, object_type, object_id, approver_id, action, note, created_at | PK approval_id |
| TeachingWorkloads | Khối lượng giảng dạy | workload_id, user_id, cycle_id, standard_hours, actual_hours | PK workload_id; FK user_id, cycle_id |
| WorkloadReductions | Miễn giảm | reduction_id, user_id, position_id, rate, reason, valid_from, valid_to | PK reduction_id; FK user_id, position_id |
| ResearchOutputs | Sản phẩm NCKH | research_id, user_id, type, title, doi, level, published_date, points | PK research_id; FK user_id |
| CommunityServices | Phục vụ cộng đồng | service_id, user_id, title, partner, hours, date, evidence_id | PK service_id; FK user_id |
| DigitalTransformationMetrics | Chỉ số CĐS | metric_id, owner_type, owner_id, metric_name, value, source_system | PK metric_id |
| Notifications | Thông báo | notification_id, user_id, title, content, read_status, created_at | PK notification_id; FK user_id |
| AuditLogs | Nhật ký hệ thống | log_id, user_id, action, object_type, object_id, ip_address, created_at | PK log_id; FK user_id |


| Chức năng | BGH | Hội đồng | TCCB/QA | Trưởng đơn vị | Cá nhân | Quản trị |
| --- | --- | --- | --- | --- | --- | --- |
| Xem dashboard toàn trường | X | X | X |  |  | X |
| Cấu hình chu kỳ KPI |  |  | X |  |  | X |
| Tạo/sửa bộ KPI mẫu |  |  | X |  |  | X |
| Phê duyệt bộ KPI | X |  | X |  |  |  |
| Giao KPI cho đơn vị | X |  | X | X |  |  |
| Đăng ký KPI cá nhân |  |  |  |  | X |  |
| Duyệt kế hoạch cấp dưới | X |  |  | X |  |  |
| Cập nhật tiến độ/minh chứng |  |  |  | X | X |  |
| Tự đánh giá |  |  |  | X | X |  |
| Đánh giá cấp trên | X |  |  | X |  |  |
| Rà soát/chuẩn hóa điểm |  | X | X |  |  |  |
| Khóa kết quả cuối kỳ | X | X | X |  |  | X |
| Xuất báo cáo lương thưởng | X |  | X |  |  |  |
| Quản lý người dùng/phân quyền |  |  |  |  |  | X |
| Xem nhật ký hệ thống |  |  | X |  |  | X |


| Nhóm menu | Chức năng con |
| --- | --- |
| Trang chủ/Dashboard | Dashboard cá nhân; dashboard đơn vị; dashboard toàn trường; cảnh báo. |
| Kế hoạch KPI | KPI được giao; đăng ký KPI; phê duyệt kế hoạch; điều chỉnh KPI. |
| Theo dõi tiến độ | Cập nhật tiến độ; biểu đồ tiến độ; danh sách chậm tiến độ; lịch nhắc việc. |
| Minh chứng | Kho minh chứng; nộp minh chứng; kiểm tra minh chứng; yêu cầu bổ sung. |
| Đánh giá | Tự đánh giá; đánh giá cấp trên; đánh giá hội đồng; khiếu nại/giải trình. |
| Báo cáo | Cá nhân; đơn vị; toàn trường; lương tăng thêm; khen thưởng; quy hoạch; cải tiến chất lượng. |
| Danh mục KPI | Nhóm KPI; chỉ số KPI; mẫu KPI; công thức; trọng số; mức xếp loại. |
| Quản trị | Người dùng; vai trò; cơ cấu tổ chức; năm học; chu kỳ; cấu hình hệ thống; nhật ký. |
| Tích hợp | LMS; đào tạo; NCKH; văn bản; nhân sự; tài chính; ticket; email; SSO. |


| Màn hình | Mô tả giao diện |
| --- | --- |
| Dashboard BGH | Thẻ tổng điểm toàn trường, xếp hạng đơn vị, biểu đồ theo nhóm KPI, cảnh báo đơn vị chưa đạt, nút xem báo cáo chiến lược. |
| Dashboard Trưởng đơn vị | Tổng quan KPI đơn vị, danh sách cá nhân chậm tiến độ, phê duyệt kế hoạch, đánh giá cấp dưới. |
| Trang KPI cá nhân | Danh sách KPI, mục tiêu, trọng số, tiến độ, minh chứng, điểm tự đánh giá, phản hồi cấp trên. |
| Trang nộp minh chứng | Kéo thả tệp, nhập URL, chọn KPI liên quan, xem trạng thái duyệt, lịch sử chỉnh sửa. |
| Trang đánh giá | Bảng điểm tự đánh giá, điểm hệ thống đề xuất, minh chứng, điểm cấp trên, ghi chú, nút gửi hội đồng. |
| Trang hội đồng | Danh sách hồ sơ, bộ lọc chênh lệch điểm, kiểm tra minh chứng, chuẩn hóa điểm, khóa kết quả. |
| Trang cấu hình KPI | Cây nhóm KPI, chỉ số, công thức, trọng số, loại minh chứng, ngưỡng, trạng thái phê duyệt. |


| Báo cáo | Nội dung | Người dùng |
| --- | --- | --- |
| Báo cáo KPI cá nhân | Điểm theo nhóm, minh chứng, xếp loại, nhận xét, kế hoạch cải tiến cá nhân. | Cá nhân, trưởng đơn vị |
| Báo cáo KPI đơn vị | Tỷ lệ hoàn thành, xếp loại nhân sự, KPI đào tạo/NCKH/phục vụ/CĐS. | Trưởng đơn vị, BGH |
| Báo cáo toàn trường | Tổng hợp theo đơn vị, nhóm KPI, thời gian, xu hướng, cảnh báo. | BGH, hội đồng |
| Báo cáo lương tăng thêm | Danh sách xếp loại, hệ số đề xuất, ghi chú trường hợp đặc biệt. | TCCB, Tài chính, BGH |
| Báo cáo khen thưởng | Cá nhân/đơn vị xuất sắc, minh chứng nổi bật, đề xuất hình thức khen thưởng. | TCCB, hội đồng thi đua |
| Báo cáo cải tiến chất lượng | KPI chưa đạt, nguyên nhân, giải pháp, kế hoạch năm sau. | QA, BGH, đơn vị |


| Hệ thống | Dữ liệu tích hợp | Phương án |
| --- | --- | --- |
| Hệ thống quản lý đào tạo | Lớp, học phần, TKB, giờ giảng, nộp điểm, tốt nghiệp, chuẩn đầu ra. | API/ETL định kỳ. |
| LMS | Log lớp học, học liệu số, bài tập, điểm danh, hoạt động sinh viên. | API/LTI/Webhook. |
| Hệ thống NCKH | Đề tài, công bố, DOI, sản phẩm chuyển giao, sở hữu trí tuệ. | API/Import Excel. |
| Hệ thống văn bản/DMS | Tỷ lệ văn bản xử lý số, phê duyệt, chữ ký số, thời hạn xử lý. | API/SSO. |
| Hệ thống nhân sự | Hồ sơ cán bộ, chức vụ, đơn vị, hợp đồng, thay đổi nhiệm vụ. | API/Database view. |
| Hệ thống tài chính | Doanh thu chuyển giao, kinh phí đề tài, lương tăng thêm. | API/Export bảo mật. |
| Ticket/SLA | Yêu cầu hỗ trợ, thời gian phản hồi, thời gian xử lý, mức hài lòng. | API/Webhook. |
| Email/Notification | Gửi nhắc hạn, phê duyệt, yêu cầu bổ sung minh chứng, thông báo kết quả. | SMTP/API. |
| SSO/LDAP/OAuth2 | Đăng nhập một lần, đồng bộ tài khoản, phân quyền theo nhóm. | OIDC/SAML/LDAP. |


| Lớp kiến trúc | Thành phần | Đề xuất công nghệ |
| --- | --- | --- |
| Frontend | Web UI responsive, dashboard, form nhập KPI, upload minh chứng. | React/Vue/Angular; Bootstrap/Tailwind; biểu đồ ECharts/Chart.js. |
| Backend API | REST/GraphQL API, nghiệp vụ KPI, tính điểm, workflow phê duyệt. | .NET Core hoặc Java Spring Boot; Node.js nếu đội ngũ phù hợp. |
| Database | Lưu dữ liệu nghiệp vụ, cấu hình, điểm, đánh giá. | PostgreSQL/SQL Server/MySQL. |
| File storage | Lưu minh chứng PDF/Word/Excel/hình ảnh. | MinIO/Object Storage/NAS nội bộ. |
| Authentication | Đăng nhập, SSO, phân quyền. | LDAP/OAuth2/OIDC/SAML; JWT cho API. |
| Reporting | Báo cáo động, dashboard, xuất PDF/Excel. | Metabase/Superset/Power BI/JasperReports. |
| Notification | Email, thông báo trong app, nhắc hạn. | SMTP, queue, background job. |
| Integration API | Đồng bộ dữ liệu đào tạo, LMS, NCKH, nhân sự. | API Gateway, ETL, message queue. |
| Audit & Security | Nhật ký, truy vết, phân quyền, mã hóa. | AuditLog, RBAC, encryption at rest/in transit. |
| Deployment | Triển khai nội bộ hoặc cloud riêng. | Docker, Kubernetes hoặc VM; CI/CD GitLab/Jenkins. |


| Nhóm yêu cầu | Mô tả |
| --- | --- |
| Bảo mật | Phân quyền theo vai trò và phạm vi đơn vị; mã hóa HTTPS; kiểm soát truy cập minh chứng; ghi nhật ký đầy đủ. |
| Hiệu năng | Hỗ trợ đồng thời nhiều người dùng trong giai đoạn đăng ký/tự đánh giá; dashboard tải nhanh; có cache báo cáo. |
| Khả năng mở rộng | Mở rộng số đơn vị, người dùng, KPI, chu kỳ, dữ liệu tích hợp mà không sửa lõi hệ thống. |
| Tính sẵn sàng | Có sao lưu định kỳ, phục hồi dữ liệu, giám sát hệ thống, cảnh báo lỗi. |
| Dễ sử dụng | Giao diện tiếng Việt, quy trình rõ, biểu mẫu quen thuộc, hỗ trợ cán bộ không chuyên CNTT. |
| Tuân thủ dữ liệu | Bảo vệ dữ liệu cá nhân, giới hạn quyền xem hồ sơ đánh giá, lưu vết truy cập và chỉnh sửa. |
| Khả năng tích hợp | Có API, import/export Excel, webhook, cấu hình mapping dữ liệu. |
| Kiểm soát thay đổi | Dữ liệu đã phê duyệt phải khóa, mọi chỉnh sửa sau khóa cần có quyền đặc biệt và log. |


| Giai đoạn | Thời lượng tham khảo | Nội dung | Kết quả |
| --- | --- | --- | --- |
| GĐ1 - Khảo sát và chuẩn hóa yêu cầu | 4-6 tuần | Khảo sát quy trình hiện tại, thống nhất bộ KPI, phân quyền, biểu mẫu, nguồn dữ liệu. | SRS, bộ KPI chuẩn, kế hoạch triển khai. |
| GĐ2 - Thiết kế chi tiết | 4-6 tuần | Thiết kế UI/UX, database, API, kiến trúc, workflow, báo cáo. | Tài liệu thiết kế chi tiết, prototype. |
| GĐ3 - Phát triển MVP | 10-14 tuần | Xây module lõi: đăng nhập, KPI, kế hoạch, tiến độ, minh chứng, đánh giá, báo cáo cơ bản. | Phiên bản chạy thử. |
| GĐ4 - Thí điểm | 8-12 tuần | Triển khai cho một số khoa/phòng, thu phản hồi, hiệu chỉnh công thức và quy trình. | Báo cáo thí điểm, danh sách cải tiến. |
| GĐ5 - Mở rộng toàn trường | 1 năm học | Triển khai toàn bộ đơn vị, tích hợp hệ thống nguồn, đào tạo người dùng. | Hệ thống vận hành chính thức. |
| GĐ6 - Tối ưu và phân tích dữ liệu | Liên tục | Dashboard nâng cao, AI gợi ý rủi ro, phân tích xu hướng và cải tiến chất lượng. | Hệ thống quản trị hiệu suất thông minh. |


| Rủi ro | Tác động | Giải pháp |
| --- | --- | --- |
| KPI quá nhiều hoặc quá phức tạp | Người dùng ngại nhập liệu, khó đánh giá công bằng. | Giới hạn KPI lõi, phân nhóm bắt buộc/tùy chọn, thí điểm trước khi mở rộng. |
| Minh chứng không chuẩn hóa | Khó kiểm tra, tranh cãi điểm. | Quy định loại minh chứng bắt buộc, trạng thái duyệt, mẫu minh chứng. |
| Dữ liệu tích hợp không đầy đủ | Điểm tự động sai hoặc thiếu. | Có cơ chế nhập tay có kiểm duyệt; đối soát dữ liệu định kỳ. |
| Tâm lý e ngại KPI | Chống đối, nhập liệu hình thức. | Truyền thông rõ mục tiêu cải tiến, không chỉ dùng để kiểm soát; đào tạo người dùng. |
| Chênh lệch đặc thù giữa đơn vị | Đánh giá không công bằng. | Cho phép cấu hình trọng số và KPI đặc thù theo nhóm đơn vị. |
| Bảo mật dữ liệu cá nhân | Rò rỉ kết quả đánh giá, mất niềm tin. | RBAC, mã hóa, audit log, giới hạn quyền tải/xem minh chứng. |
| Quá tải thời điểm cuối kỳ | Hệ thống chậm, người dùng không nộp kịp. | Nhắc hạn sớm, autosave, mở đánh giá theo nhiều đợt, tối ưu hiệu năng. |
