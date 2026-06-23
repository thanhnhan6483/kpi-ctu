**ĐẠI HỌC CẦN THƠ**
**TÀI LIỆU THIẾT KẾ TỔNG QUAN**
**HỆ THỐNG KPIs ĐẠI HỌC CẦN THƠ**
*Định hướng quản trị theo MBO/BSC/KPI, minh chứng số và dashboard điều hành*



# MỤC LỤC
I. Giới thiệu
II. Căn cứ và bối cảnh xây dựng hệ thống
III. Mục tiêu hệ thống KPIs Đại học Cần Thơ
IV. Nguyên tắc thiết kế KPI
V. Mô hình quản trị KPI theo MBO/BSC
VI. Phân loại KPI theo lĩnh vực hoạt động
VII. Bộ KPI cấp Trường
VIII. Bộ KPI cấp đơn vị
IX. Bộ KPI cá nhân
X. Quy trình nghiệp vụ vận hành KPI
XI. Chức năng hệ thống phần mềm
XII. Vai trò người dùng và phân quyền
XIII. Dashboard và báo cáo điều hành
XIV. Thiết kế dữ liệu tổng quan
XV. Công thức tính điểm và xếp loại KPI
XVI. Tích hợp dữ liệu
XVII. Kiến trúc hệ thống đề xuất
XVIII. MVP triển khai thí điểm
XIX. Lộ trình triển khai
XX. Rủi ro và giải pháp
XXI. Kết luận và kiến nghị
Tài liệu tham khảo

# I. Giới thiệu
Tài liệu này đề xuất mô hình Hệ thống KPIs Đại học Cần Thơ nhằm hỗ trợ quản trị đại học hiện đại, đo lường kết quả thực hiện nhiệm vụ chiến lược, tăng cường trách nhiệm giải trình, chuẩn hóa minh chứng và cung cấp dashboard điều hành cho lãnh đạo các cấp.
Hệ thống được thiết kế theo nguyên tắc kết nối mục tiêu chiến lược của Trường với mục tiêu đơn vị và mục tiêu cá nhân. Mỗi KPI có công thức, đơn vị đo, chỉ tiêu, trọng số, chu kỳ, nguồn dữ liệu, đơn vị chủ trì và minh chứng số rõ ràng.
Phạm vi tài liệu bao gồm mô hình quản trị KPI, phân loại chỉ số, bộ KPI cấp Trường, KPI đơn vị, KPI cá nhân, quy trình vận hành, chức năng phần mềm, phân quyền, dashboard, thiết kế dữ liệu, công thức điểm, tích hợp, kiến trúc, MVP và lộ trình triển khai.
# II. Căn cứ và bối cảnh xây dựng hệ thống
Theo thông tin giới thiệu công khai, Đại học Cần Thơ là cơ sở đào tạo đại học và sau đại học trọng điểm của Nhà nước ở vùng Đồng bằng sông Cửu Long, đồng thời là trung tâm văn hóa - khoa học kỹ thuật của vùng. Trường có sứ mệnh đào tạo, nghiên cứu khoa học, chuyển giao công nghệ và phục vụ phát triển kinh tế - xã hội vùng và quốc gia.
Website chính thức của ĐHCT cũng thể hiện các nhóm hoạt động cốt lõi như giới thiệu, tuyển sinh, đào tạo, nghiên cứu, hợp tác, đơn vị trực thuộc, người học, viên chức, cựu sinh viên; đồng thời cung cấp các dịch vụ tiện ích như học trực tuyến, thi trực tuyến, văn phòng điện tử, văn bản và hệ thống tích hợp. Đây là nền tảng quan trọng để xây dựng hệ thống KPI dựa trên dữ liệu số.
Bối cảnh quản trị đại học hiện nay đòi hỏi các chỉ tiêu không chỉ được giao cuối năm mà phải được theo dõi liên tục, có cảnh báo sớm, có minh chứng số và có khả năng tổng hợp theo lĩnh vực, đơn vị, thời gian và đối tượng chịu trách nhiệm.
## Các vấn đề nếu quản lý KPI bằng Excel/thủ công
Dữ liệu phân tán, khó kiểm soát phiên bản và khó truy vết người cập nhật.
Công thức tính điểm không đồng nhất giữa các đơn vị, dễ sai lệch khi tổng hợp.
Minh chứng lưu rời rạc, khó kiểm tra, khó đối chiếu và dễ thất lạc.
Lãnh đạo không có dashboard thời gian thực để phát hiện KPI có nguy cơ không đạt.
Khó kết nối KPI với thi đua, đánh giá viên chức, thu nhập tăng thêm và khen thưởng.
Tốn nhiều thời gian rà soát, chuẩn hóa dữ liệu, tổng hợp báo cáo cuối kỳ.
# III. Mục tiêu hệ thống KPIs Đại học Cần Thơ
Chuẩn hóa hệ thống mục tiêu, chỉ tiêu và chỉ số đo lường hiệu quả hoạt động toàn Trường.
Liên kết mục tiêu cấp Trường với KPI cấp đơn vị, bộ môn/tổ chuyên môn và cá nhân.
Tự động hóa quy trình giao KPI, đăng ký KPI, cập nhật kết quả, phê duyệt, đánh giá và báo cáo.
Tạo kho minh chứng số tập trung, có phân quyền, kiểm tra đầy đủ và truy vết lịch sử.
Cung cấp dashboard điều hành giúp Ban Giám hiệu theo dõi tiến độ, chất lượng và rủi ro không đạt KPI.
Tích hợp dữ liệu từ các hệ thống đào tạo, nhân sự, khoa học công nghệ, tài chính, khảo sát, LMS và Eoffice.
Tạo nền tảng cho quản trị dựa trên dữ liệu, cải tiến liên tục và hỗ trợ ra quyết định.
# IV. Nguyên tắc thiết kế KPI

# V. Mô hình quản trị KPI theo MBO/BSC
Mô hình đề xuất kết hợp MBO và BSC. MBO giúp giao mục tiêu rõ ràng từ cấp trên xuống cấp dưới, trong khi BSC giúp cân bằng các lĩnh vực hoạt động: đào tạo, nghiên cứu, người học, tài chính, quy trình nội bộ, học hỏi - phát triển, chuyển đổi số và phục vụ cộng đồng.



Nguyên tắc cascade: mỗi KPI cấp Trường được gán cho một đơn vị chủ trì và các đơn vị phối hợp; đơn vị chủ trì phân bổ thành chỉ tiêu thành phần theo quy mô, chức năng và năng lực thực hiện. Nguyên tắc roll-up: điểm KPI cấp đơn vị được tổng hợp từ KPI chuyên môn của đơn vị và kết quả cá nhân, sau đó chuẩn hóa theo trọng số lĩnh vực để hình thành điểm cấp Trường.
# VI. Phân loại KPI theo lĩnh vực hoạt động


# VII. Bộ KPI cấp Trường
Bộ KPI cấp Trường gồm các KPI chiến lược có khả năng phản ánh trực tiếp mức độ hoàn thành mục tiêu năm học/năm tài chính. Trọng số đề xuất có thể điều chỉnh theo nghị quyết hoặc kế hoạch năm của Trường. Gợi ý tổng trọng số: Đào tạo 35%, KHCN và đổi mới sáng tạo 30%, đội ngũ 10%, quốc tế hóa 8%, quản trị - tài chính 10%, chuyển đổi số 7%.
# VIII. Bộ KPI cấp đơn vị

Tham khảo thêm file KPIs chi tiết cho đơn vị.
# IX. Bộ KPI cá nhân

Điểm KPI cá nhân được gắn với đánh giá viên chức/người lao động, thi đua, khen thưởng và thu nhập tăng thêm theo nguyên tắc: kết quả phải có minh chứng hợp lệ; điểm do cá nhân tự cập nhật được cấp trên xác nhận; điểm cuối kỳ được hội đồng/đơn vị có thẩm quyền rà soát trước khi khóa.

Tham khảo tài liệu KPIs chi tiết cá nhân
# X. Quy trình nghiệp vụ vận hành KPI

Mỗi bước quy trình cần có trạng thái rõ ràng: Nháp, Chờ duyệt, Yêu cầu chỉnh sửa, Đã duyệt, Đang theo dõi, Đã nộp kết quả, Đã xác nhận, Đã đánh giá, Đã khóa. Tất cả thao tác phải ghi nhật ký để phục vụ kiểm tra và truy vết.

# XI. Chức năng hệ thống phần mềm

# XII. Vai trò người dùng và phân quyền

# XIII. Dashboard và báo cáo điều hành

Các chỉ báo cảnh báo sớm nên bao gồm: KPI dưới 70% tiến độ theo thời gian, KPI thiếu minh chứng, dữ liệu tăng/giảm bất thường, KPI chưa có đơn vị chủ trì, KPI chưa có nguồn dữ liệu, đơn vị chậm phê duyệt và cá nhân chưa cập nhật kết quả.
# XIV. Thiết kế dữ liệu tổng quan

# XV. Công thức tính điểm và xếp loại KPI
Công thức cơ bản cho KPI định lượng hướng tăng: Điểm KPI = min(Giá trị thực hiện / Chỉ tiêu x 100, Ngưỡng điểm tối đa). Đề xuất ngưỡng điểm tối đa 120 điểm để ghi nhận vượt chỉ tiêu nhưng tránh làm mất cân bằng tổng điểm.
Đối với KPI hướng giảm như thời gian xử lý, tỷ lệ lỗi hoặc số hồ sơ trễ hạn: Điểm KPI = min(Chỉ tiêu / Giá trị thực hiện x 100, 120), trong đó cần quy định rõ giá trị tối thiểu và điều kiện loại trừ.

Điểm tổng hợp cấp cá nhân/đơn vị/trường = tổng (Điểm KPI thành phần x Trọng số KPI) / tổng trọng số. KPI thiếu dữ liệu hoặc thiếu minh chứng được tạm tính 0 điểm hoặc trạng thái “Chưa đủ điều kiện đánh giá” tùy quy định. Điểm giữa các đơn vị cần chuẩn hóa theo quy mô sinh viên, giảng viên, chương trình đào tạo hoặc nhiệm vụ đặc thù để bảo đảm công bằng.
# XVI. Tích hợp dữ liệu

# XVII. Kiến trúc hệ thống đề xuất
Kiến trúc hệ thống được đề xuất theo mô hình web-based, có khả năng triển khai on-premise hoặc hybrid. Hệ thống cần hỗ trợ xác thực tập trung, phân quyền RBAC, tích hợp API/ETL, lưu trữ minh chứng số, dashboard BI và nhật ký truy vết.

Luồng dữ liệu tổng quát: Hệ thống nguồn → API/ETL → vùng kiểm tra dữ liệu → kho KPI → dashboard/BI → báo cáo và AI Assistant. Các dữ liệu nhạy cảm như nhân sự, tài chính, đánh giá cá nhân cần phân quyền chặt chẽ và ghi nhật ký truy cập.
# XVIII. MVP triển khai thí điểm
MVP nên triển khai trong 3–6 tháng, ưu tiên số hóa quy trình giao KPI, cập nhật kết quả, minh chứng và dashboard cơ bản. Không nên tích hợp tất cả hệ thống ngay từ đầu; cần cho phép import Excel chuẩn hóa để nhanh chóng chạy thí điểm.

# XIX. Lộ trình triển khai

# XX. Rủi ro và giải pháp

# XXI. Kết luận và kiến nghị
Hệ thống KPIs Đại học Cần Thơ cần được xem là một nền tảng quản trị hiệu suất tổng thể, không chỉ là phần mềm nhập điểm KPI. Giá trị cốt lõi của hệ thống nằm ở khả năng kết nối mục tiêu chiến lược với dữ liệu vận hành, minh chứng số, trách nhiệm giải trình và dashboard điều hành.
Kiến nghị triển khai theo hướng thí điểm trước, chuẩn hóa dữ liệu trước, sau đó mở rộng toàn Trường và tích hợp dần các hệ thống nguồn. Trong giai đoạn đầu, nên tập trung vào 23 KPI cấp Trường, quy trình giao - đăng ký - cập nhật - phê duyệt - báo cáo, kèm dashboard cơ bản cho Ban Giám hiệu và trưởng đơn vị.
Về dài hạn, hệ thống nên phát triển thành nền tảng quản trị đại học dựa trên dữ liệu, có Data Warehouse, BI nâng cao và AI Assistant hỗ trợ lãnh đạo, đơn vị và cá nhân trong việc theo dõi, phân tích, giải thích và cải thiện kết quả KPI.
# Tài liệu tham khảo
Website chính thức Đại học Cần Thơ: https://www.ctu.edu.vn/
Giới thiệu Đại học Cần Thơ: https://www.ctu.edu.vn/gioi-thieu/gioi-thieu.html
Đơn vị trực thuộc Đại học Cần Thơ: https://www.ctu.edu.vn/don-vi-truc-thuoc.html
Tầm nhìn - Sứ mệnh - Giá trị cốt lõi - Mục tiêu giáo dục: https://www.ctu.edu.vn/webctu_old/muc-tieu-giao-duc.html
Tọa đàm định hướng phát triển Trường ĐHCT giai đoạn 2025-2030, tầm nhìn đến năm 2045: https://www.ctu.edu.vn/tin-tuc-su-kien/toa-dam-dinh-huong-phat-trien-truong-dai-hoc-can-tho-giai-doan-2025-2030-tam-nhin-den-nam-2045.html
Khung 23 chỉ số hoạt động/KPI do người dùng cung cấp trong tệp đầu vào.

| Thông tin | Nội dung |
| --- | --- |
| Phiên bản | 1.0 - Bản đề xuất tổng quan |
| Phạm vi | Cấp Trường, đơn vị, bộ môn/tổ chuyên môn và cá nhân |
| Căn cứ đầu vào | Khung 23 chỉ số hoạt động/KPI do người dùng cung cấp; thông tin công khai trên website ĐHCT |
| Định hướng | Quản trị theo mục tiêu MBO, đo lường theo BSC/KPI, dữ liệu số, minh chứng số và báo cáo điều hành |


| Nguyên tắc | Mô tả áp dụng |
| --- | --- |
| SMART | KPI phải cụ thể, đo được, khả thi, phù hợp mục tiêu chiến lược và có thời hạn. |
| Cascade | KPI cấp Trường được phân rã xuống đơn vị và cá nhân theo chức năng, nhiệm vụ và mức đóng góp. |
| Roll-up | Kết quả cấp cá nhân/đơn vị được tổng hợp ngược lên cấp Trường theo trọng số và công thức chuẩn. |
| Minh chứng số | Mỗi kết quả cần gắn minh chứng hoặc dữ liệu tích hợp từ hệ thống nguồn. |
| Một nguồn sự thật | Mỗi KPI có nguồn dữ liệu chính thức, tránh nhập trùng và tránh số liệu mâu thuẫn. |
| Công bằng theo quy mô | Các KPI cần chuẩn hóa theo quy mô giảng viên, sinh viên, nguồn lực hoặc nhiệm vụ đặc thù. |
| Cảnh báo sớm | Hệ thống phải phát hiện chậm tiến độ, thiếu minh chứng, dữ liệu bất thường hoặc nguy cơ không đạt. |


| Tầng quản trị | Vai trò | Đầu ra KPI chính |
| --- | --- | --- |
| Cấp Trường | Xác định mục tiêu chiến lược, chỉ tiêu năm, trọng số lĩnh vực và cơ chế đánh giá | Bộ KPI cấp Trường, dashboard BGH, báo cáo tổng hợp |
| Ban Giám hiệu | Phụ trách các mảng chiến lược; theo dõi, chỉ đạo, phê duyệt kết quả | KPI theo lĩnh vực phụ trách và cảnh báo điều hành |
| Đơn vị | Nhận KPI, phân bổ chỉ tiêu, tổ chức thực hiện và xác nhận minh chứng | KPI đơn vị, kế hoạch thực hiện, minh chứng đơn vị |
| Bộ môn/tổ chuyên môn | Phân rã KPI chuyên môn, theo dõi hoạt động giảng dạy và nghiên cứu | KPI bộ môn/tổ và tổng hợp cá nhân |
| Cá nhân | Đăng ký nhiệm vụ, cập nhật kết quả và minh chứng | KPI cá nhân, điểm đánh giá, hồ sơ minh chứng |


| TT | Chỉ số hoạt động | Yêu cầu | Lĩnh vực phân loại |
| --- | --- | --- | --- |
| 1 | Tỉ lệ giảng viên toàn thời gian có trình độ tiến sĩ | ≥59% | Đội ngũ, nhân lực và phát triển giảng viên |
| 2 | Tỉ lệ học phần sẵn sàng giảng dạy trực tuyến | ≥10% | Đào tạo và đảm bảo chất lượng giáo dục |
| 3 | Chỉ số tăng trưởng bền vững | ≥10% | Quản trị đại học, tài chính và phát triển bền vững |
| 4 | Biên độ hoạt động trung bình 3 năm | ≥10% | Quản trị đại học, tài chính và phát triển bền vững |
| 5 | Tỉ lệ tuyển sinh đại học chính quy | ≥90% | Đào tạo và đảm bảo chất lượng giáo dục |
| 6 | Tỉ lệ SV chính quy tốt nghiệp đúng hạn | ≥80% | Đào tạo và đảm bảo chất lượng giáo dục |
| 7 | Số lượng CTĐT hoàn thành tự đánh giá | 14 | Đào tạo và đảm bảo chất lượng giáo dục |
| 8 | Tỉ lệ người tốt nghiệp có việc làm trong thời gian 12 tháng sau tốt nghiệp | ≥90% | Đào tạo và đảm bảo chất lượng giáo dục |
| 9 | Tỉ lệ người tốt nghiệp có việc làm phù hợp/tự tạo việc làm/học tiếp sau 12 tháng | >70% | Đào tạo và đảm bảo chất lượng giáo dục |
| 10 | Tỉ lệ người học hài lòng với giảng viên về chất lượng và hiệu quả giảng dạy | ≥80% | Đào tạo và đảm bảo chất lượng giáo dục |
| 11 | Tỉ lệ người tốt nghiệp hài lòng tổng thể về quá trình học tập và trải nghiệm | >70% | Đào tạo và đảm bảo chất lượng giáo dục |
| 12 | Tỉ trọng thu từ hoạt động khoa học và công nghệ trên tổng thu | ≥10% | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ |
| 13 | Số công bố trên giảng viên | ≥1,6 | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ |
| 14 | Số công bố WoS, Scopus bình quân trên giảng viên | ≥0,6 | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ |
| 15 | Số lượng đơn đăng ký SHTT được chấp nhận | 14 | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ |
| 16 | Số lượng đề tài NCKH hợp tác với địa phương/doanh nghiệp | 20 | Phục vụ cộng đồng và gắn kết địa phương/doanh nghiệp |
| 17 | Số lượng đề tài NCKH cấp cơ sở của sinh viên | 400 | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ |
| 18 | Tỉ lệ VC-NLĐ tham gia chủ nhiệm đề tài NCKH cấp cơ sở | ≥10% | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ |
| 19 | Số lượng SV quốc tế học tại trường dài hạn/ngắn hạn | 700 | Hợp tác quốc tế và trao đổi học thuật |
| 20 | Số lượng sinh viên trao đổi tín chỉ | 100 | Hợp tác quốc tế và trao đổi học thuật |
| 21 | Số giảng viên được công nhận đạt chuẩn chức danh giáo sư, phó giáo sư | 15 | Đội ngũ, nhân lực và phát triển giảng viên |
| 22 | Tỉ lệ quy trình và hồ sơ công việc của từng đơn vị được xử lý trên môi trường mạng | ≥80% | Chuyển đổi số và quản trị số |
| 23 | Văn bản nội bộ của ĐHCT luân chuyển trên hệ thống Eoffice được ký số | 100% | Chuyển đổi số và quản trị số |


| Lĩnh vực | Mục tiêu quản trị | KPI liên quan | Nguồn dữ liệu | Đơn vị chịu trách nhiệm |
| --- | --- | --- | --- | --- |
| Đào tạo và đảm bảo chất lượng giáo dục | Nâng cao tuyển sinh, chất lượng đào tạo, tốt nghiệp đúng hạn, việc làm và trải nghiệm người học | 2, 5, 6, 7, 8, 9, 10, 11 | Hệ thống đào tạo, khảo sát, ĐBCL, LMS | Phòng Đào tạo; Phòng ĐBCL; các khoa/trường |
| KHCN, đổi mới sáng tạo và SHTT | Gia tăng sản phẩm nghiên cứu, công bố, SHTT, đề tài SV và sự tham gia của VC-NLĐ | 12, 13, 14, 15, 17, 18 | Hệ thống KHCN, CSDL công bố, tài chính, hồ sơ SHTT | Phòng KHCN; các đơn vị đào tạo/nghiên cứu |
| Đội ngũ, nhân lực và phát triển giảng viên | Phát triển chất lượng đội ngũ, trình độ tiến sĩ và chức danh GS/PGS | 1, 21 | Hệ thống nhân sự, hồ sơ cán bộ | Phòng Tổ chức cán bộ; các đơn vị |
| Hợp tác quốc tế và trao đổi học thuật | Mở rộng quốc tế hóa, SV quốc tế và trao đổi tín chỉ | 19, 20 | Hệ thống hợp tác quốc tế, đào tạo, cổng SV | Phòng Hợp tác quốc tế; Phòng Đào tạo |
| Quản trị đại học, tài chính và phát triển bền vững | Đảm bảo tăng trưởng, hiệu quả tài chính và năng lực phát triển bền vững | 3, 4 | Tài chính, kế hoạch, báo cáo quản trị | Phòng Kế hoạch - Tài chính |
| Chuyển đổi số và quản trị số | Số hóa quy trình, hồ sơ công việc, ký số và văn phòng điện tử | 22, 23 | Eoffice, hệ thống quản lý văn bản, quy trình số | Văn phòng Trường; đơn vị CNTT |
| Phục vụ cộng đồng và gắn kết địa phương/doanh nghiệp | Đẩy mạnh nghiên cứu, chuyển giao và hợp tác giải quyết bài toán địa phương/doanh nghiệp | 16 | Hệ thống KHCN, hợp đồng, biên bản hợp tác | Phòng KHCN; các đơn vị |


| Mã KPI | Tên KPI | Lĩnh vực | Công thức tính | Đơn vị | Chỉ tiêu | Trọng số | Tần suất | Nguồn dữ liệu | Chủ trì | Minh chứng | Mức đánh giá |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CTU-KPI-01 | Tỉ lệ giảng viên toàn thời gian có trình độ tiến sĩ | Đội ngũ, nhân lực và phát triển giảng viên | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥59% | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-02 | Tỉ lệ học phần sẵn sàng giảng dạy trực tuyến | Đào tạo và đảm bảo chất lượng giáo dục | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥10% | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-03 | Chỉ số tăng trưởng bền vững | Quản trị đại học, tài chính và phát triển bền vững | Tổng số kết quả hợp lệ được xác nhận trong kỳ | % | ≥10% | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-04 | Biên độ hoạt động trung bình 3 năm | Quản trị đại học, tài chính và phát triển bền vững | Tổng số kết quả hợp lệ được xác nhận trong kỳ | % | ≥10% | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-05 | Tỉ lệ tuyển sinh đại học chính quy | Đào tạo và đảm bảo chất lượng giáo dục | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥90% | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-06 | Tỉ lệ SV chính quy tốt nghiệp đúng hạn | Đào tạo và đảm bảo chất lượng giáo dục | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥80% | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-07 | Số lượng CTĐT hoàn thành tự đánh giá | Đào tạo và đảm bảo chất lượng giáo dục | Tổng số kết quả hợp lệ được xác nhận trong kỳ | Số lượng | 14 | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-08 | Tỉ lệ người tốt nghiệp có việc làm trong thời gian 12 tháng sau tốt nghiệp | Đào tạo và đảm bảo chất lượng giáo dục | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥90% | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-09 | Tỉ lệ người tốt nghiệp có việc làm phù hợp/tự tạo việc làm/học tiếp sau 12 tháng | Đào tạo và đảm bảo chất lượng giáo dục | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | >70% | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-10 | Tỉ lệ người học hài lòng với giảng viên về chất lượng và hiệu quả giảng dạy | Đào tạo và đảm bảo chất lượng giáo dục | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥80% | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-11 | Tỉ lệ người tốt nghiệp hài lòng tổng thể về quá trình học tập và trải nghiệm | Đào tạo và đảm bảo chất lượng giáo dục | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | >70% | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-12 | Tỉ trọng thu từ hoạt động khoa học và công nghệ trên tổng thu | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥10% | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-13 | Số công bố trên giảng viên | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ | Tổng số sản phẩm / tổng số giảng viên quy đổi | Số lượng | ≥1,6 | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-14 | Số công bố WoS, Scopus bình quân trên giảng viên | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ | Tổng số sản phẩm / tổng số giảng viên quy đổi | Số lượng | ≥0,6 | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-15 | Số lượng đơn đăng ký SHTT được chấp nhận | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ | Tổng số kết quả hợp lệ được xác nhận trong kỳ | Số lượng | 14 | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-16 | Số lượng đề tài NCKH hợp tác với địa phương/doanh nghiệp | Phục vụ cộng đồng và gắn kết địa phương/doanh nghiệp | Tổng số kết quả hợp lệ được xác nhận trong kỳ | Số lượng | 20 | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-17 | Số lượng đề tài NCKH cấp cơ sở của sinh viên | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ | Tổng số kết quả hợp lệ được xác nhận trong kỳ | Số lượng | 400 | 3 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-18 | Tỉ lệ VC-NLĐ tham gia chủ nhiệm đề tài NCKH cấp cơ sở | Khoa học công nghệ, đổi mới sáng tạo và sở hữu trí tuệ | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥10% | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-19 | Số lượng SV quốc tế học tại trường dài hạn/ngắn hạn | Hợp tác quốc tế và trao đổi học thuật | Tổng số kết quả hợp lệ được xác nhận trong kỳ | Số lượng | 700 | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-20 | Số lượng sinh viên trao đổi tín chỉ | Hợp tác quốc tế và trao đổi học thuật | Tổng số kết quả hợp lệ được xác nhận trong kỳ | Số lượng | 100 | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-21 | Số giảng viên được công nhận đạt chuẩn chức danh giáo sư, phó giáo sư | Đội ngũ, nhân lực và phát triển giảng viên | Tổng số kết quả hợp lệ được xác nhận trong kỳ | Số lượng | 15 | 5 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-22 | Tỉ lệ quy trình và hồ sơ công việc của từng đơn vị được xử lý trên môi trường mạng | Chuyển đổi số và quản trị số | Giá trị đạt được / tổng mẫu hợp lệ x 100% | % | ≥80% | 4 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |
| CTU-KPI-23 | Văn bản nội bộ của ĐHCT luân chuyển trên hệ thống Eoffice được ký số | Chuyển đổi số và quản trị số | Tổng số kết quả hợp lệ được xác nhận trong kỳ | % | 100% | 3 | Tháng/quý/năm | Hệ thống nguồn + minh chứng số | Đơn vị chủ trì theo lĩnh vực | Báo cáo, danh sách, quyết định, dữ liệu hệ thống, file minh chứng | Không đạt <90%; Đạt 90-100%; Vượt 100-120%; Xuất sắc >120% chỉ tiêu |


| Nhóm đơn vị | Vai trò | KPI mẫu | Trọng số tham khảo | Cấp phê duyệt |
| --- | --- | --- | --- | --- |
| Phòng Đào tạo | Quản lý tuyển sinh, chương trình, tiến độ học tập và tốt nghiệp | Tỉ lệ tuyển sinh; tốt nghiệp đúng hạn; học phần trực tuyến; dữ liệu SV chính xác | 20% tuyển sinh; 25% tiến độ đào tạo; 20% tốt nghiệp; 20% số hóa; 15% phối hợp | Ban Giám hiệu phụ trách đào tạo |
| Phòng Đảm bảo chất lượng | Tổ chức tự đánh giá CTĐT, khảo sát và cải tiến chất lượng | Số CTĐT tự đánh giá; mức hài lòng người học; báo cáo cải tiến sau khảo sát | 35% tự đánh giá; 30% khảo sát; 20% cải tiến; 15% báo cáo | Ban Giám hiệu phụ trách ĐBCL |
| Phòng Khoa học công nghệ | Quản lý công bố, đề tài, SHTT, doanh thu KHCN và hợp tác nghiên cứu | Công bố/GV; WoS/Scopus/GV; đơn SHTT; đề tài hợp tác; doanh thu KHCN | 30% công bố; 20% đề tài; 20% SHTT; 20% doanh thu; 10% dữ liệu | Ban Giám hiệu phụ trách KHCN |
| Phòng Hợp tác quốc tế | Quản lý SV quốc tế, trao đổi tín chỉ và hợp tác học thuật | SV quốc tế; SV trao đổi tín chỉ; MoU có hoạt động; chương trình quốc tế | 35% SV quốc tế; 25% trao đổi; 25% hợp tác; 15% báo cáo | Ban Giám hiệu phụ trách HTQT |
| Phòng Tổ chức cán bộ | Quản lý phát triển đội ngũ, trình độ tiến sĩ, GS/PGS và vị trí việc làm | Tỉ lệ GV tiến sĩ; số GS/PGS; dữ liệu nhân sự cập nhật; kế hoạch phát triển đội ngũ | 40% trình độ; 25% chức danh; 20% hồ sơ; 15% cải tiến | Ban Giám hiệu phụ trách tổ chức |
| Phòng Kế hoạch - Tài chính | Quản lý tài chính, tăng trưởng bền vững và biên độ hoạt động | Chỉ số tăng trưởng; biên độ hoạt động; báo cáo tài chính; dự báo nguồn lực | 35% tăng trưởng; 30% biên độ; 20% báo cáo; 15% dự báo | Ban Giám hiệu phụ trách tài chính |
| Văn phòng Trường | Quản lý văn bản, Eoffice, ký số, lịch công tác và điều phối hành chính | Tỉ lệ văn bản ký số; tiến độ xử lý văn bản; mức hài lòng dịch vụ hành chính | 35% ký số; 25% xử lý; 20% số hóa; 20% dịch vụ | Ban Giám hiệu |
| Đơn vị CNTT/chuyển đổi số | Vận hành nền tảng số, tích hợp dữ liệu, bảo mật và hỗ trợ người dùng | Tỉ lệ quy trình số; uptime; tích hợp API; xử lý yêu cầu; an toàn thông tin | 35% số hóa; 20% vận hành; 20% tích hợp; 15% hỗ trợ; 10% bảo mật | Ban Giám hiệu phụ trách CĐS |
| Khoa/Trường/Viện đào tạo | Tổ chức đào tạo, nghiên cứu, phục vụ người học, hợp tác và phát triển đội ngũ | Tuyển sinh; tốt nghiệp; công bố; đề tài; hài lòng; GV tiến sĩ; CTĐT tự đánh giá | 30% đào tạo; 30% KHCN; 15% đội ngũ; 15% người học; 10% số hóa | Ban Giám hiệu; trưởng đơn vị |
| Bộ môn/tổ chuyên môn | Quản lý học phần, phân công giảng dạy, nghiên cứu và hỗ trợ SV | Hoàn thành giảng dạy; học phần trực tuyến; đề tài/công bố; khảo sát hài lòng | 45% đào tạo; 30% KHCN; 15% người học; 10% hồ sơ | Trưởng khoa/trường/viện |
| Trung tâm hỗ trợ người học/thư viện/KTX | Cung cấp dịch vụ hỗ trợ học tập, sinh hoạt và trải nghiệm người học | Mức hài lòng; tiến độ xử lý yêu cầu; số hóa dịch vụ; dữ liệu dịch vụ | 40% dịch vụ; 25% hài lòng; 20% số hóa; 15% báo cáo | Ban Giám hiệu/đơn vị quản lý |


| Nhóm cá nhân | KPI bắt buộc | KPI theo vị trí việc làm | KPI theo nhiệm vụ được giao | Tỉ trọng đề xuất |
| --- | --- | --- | --- | --- |
| Giảng viên | Giảng dạy đúng kế hoạch; khảo sát hài lòng; hồ sơ học phần; tuân thủ quy định | Công bố; đề tài; hướng dẫn SV NCKH; học phần trực tuyến | Nhiệm vụ khoa/bộ môn giao; tư vấn SV; phục vụ cộng đồng | 50% đào tạo; 30% NCKH; 10% phục vụ; 10% kỷ luật/số hóa |
| Giảng viên kiêm nhiệm quản lý | Hoàn thành KPI quản lý đơn vị; đào tạo; minh chứng đầy đủ | Công bố/đề tài; cải tiến quy trình; phát triển đội ngũ | Chỉ đạo CTĐT, tuyển sinh, ĐBCL, CĐS theo phân công | 40% quản lý; 25% đào tạo; 25% NCKH; 10% phục vụ |
| Nghiên cứu viên | Sản phẩm nghiên cứu; tiến độ đề tài; báo cáo khoa học | Công bố WoS/Scopus; SHTT; chuyển giao công nghệ | Hợp tác doanh nghiệp/địa phương; hướng dẫn SV NCKH | 60% NCKH; 20% chuyển giao; 10% đào tạo/hỗ trợ; 10% số hóa |
| Chuyên viên phòng ban | Hoàn thành hồ sơ công việc; đúng hạn; chất lượng phục vụ | Số hóa quy trình; cải tiến nghiệp vụ; báo cáo quản trị | Nhiệm vụ đột xuất; phối hợp liên đơn vị; hỗ trợ người dùng | 60% nhiệm vụ chuyên môn; 20% chất lượng dịch vụ; 10% CĐS; 10% kỷ luật |
| VC-NLĐ phục vụ | Hoàn thành nhiệm vụ vận hành, dịch vụ, hỗ trợ | Cải tiến quy trình; đảm bảo an toàn, vệ sinh, thiết bị hoặc dịch vụ | Nhiệm vụ theo ca/kế hoạch; phản hồi người dùng | 70% nhiệm vụ; 15% chất lượng; 10% phối hợp; 5% kỷ luật |


| Quy trình | Hoạt động chính | Đầu ra |
| --- | --- | --- |
| 1. Thiết lập chu kỳ KPI | Tạo năm học/năm tài chính/kỳ đánh giá; khai báo mục tiêu; khai báo KPI; gán đơn vị; phân bổ chỉ tiêu; phê duyệt | Bộ KPI được kích hoạt cho kỳ đánh giá |
| 2. Đăng ký KPI đơn vị/cá nhân | Đăng nhập; xem KPI được giao; đề xuất chỉ tiêu/kế hoạch/minh chứng; gửi duyệt; duyệt hoặc yêu cầu chỉnh sửa | KPI đơn vị/cá nhân được phê duyệt |
| 3. Cập nhật kết quả và minh chứng | Cập nhật số liệu; tải minh chứng; kiểm tra định dạng; đối chiếu dữ liệu tích hợp; gửi xác nhận | Kết quả KPI có minh chứng và trạng thái xác nhận |
| 4. Đánh giá KPI cuối kỳ | Mở kỳ đánh giá; tự đánh giá; cấp trên đánh giá; hội đồng rà soát; khóa kết quả; xuất xếp loại | Điểm KPI chính thức và báo cáo xếp loại |
| 5. Khiếu nại/điều chỉnh | Gửi yêu cầu; bổ sung minh chứng; xử lý; cập nhật kết quả cuối cùng; lưu vết lịch sử | Kết quả đã xử lý khiếu nại và khóa cuối cùng |


| Phân hệ | Chức năng chi tiết | Người dùng chính | Ưu tiên |
| --- | --- | --- | --- |
| Quản trị hệ thống | Thiết lập tham số, kỳ đánh giá, cấu hình điểm, thông báo | Admin | MVP |
| Người dùng, vai trò, phân quyền | Quản lý tài khoản, nhóm quyền, vai trò theo đơn vị, RBAC | Admin, tổ chức cán bộ | MVP |
| Cơ cấu tổ chức | Quản lý cây tổ chức, chức danh, vị trí việc làm, quan hệ cấp trên | Admin, TCCB | MVP |
| Danh mục KPI | Khai báo KPI, công thức, đơn vị đo, trọng số, ngưỡng, minh chứng | Cán bộ KPI, BGH | MVP |
| Giao KPI và phân bổ chỉ tiêu | Gán KPI từ Trường xuống đơn vị/cá nhân; phân bổ trọng số | BGH, trưởng đơn vị | MVP |
| Đăng ký KPI | Đơn vị/cá nhân đề xuất kế hoạch, chỉ tiêu, minh chứng ban đầu | Đơn vị, cá nhân | MVP |
| Cập nhật kết quả | Nhập kết quả, đồng bộ dữ liệu, tải minh chứng, gửi xác nhận | Cá nhân, phụ trách KPI | MVP |
| Đánh giá và phê duyệt | Tự đánh giá, cấp trên đánh giá, hội đồng chuẩn hóa, khóa điểm | Trưởng đơn vị, hội đồng | MVP |
| Dashboard điều hành | Biểu đồ tổng quan, cảnh báo, so sánh, drill-down theo đơn vị/lĩnh vực | BGH, trưởng đơn vị | MVP/GĐ2 |
| Báo cáo thống kê | Báo cáo kỳ, báo cáo lĩnh vực, báo cáo xếp loại, xuất Word/Excel/PDF | BGH, đơn vị | MVP/GĐ2 |
| Tích hợp dữ liệu | API/ETL/import Excel từ đào tạo, nhân sự, KHCN, tài chính, Eoffice | CNTT, đơn vị nguồn | GĐ2 |
| AI Assistant | Hỏi đáp KPI, giải thích công thức, nhắc việc, tóm tắt báo cáo, phân tích rủi ro | BGH, đơn vị, cá nhân | GĐ3 |


| Vai trò | Danh mục KPI | Giao KPI | Đăng ký KPI | Cập nhật kết quả | Đánh giá | Minh chứng | Báo cáo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Quản trị hệ thống | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | Xem toàn bộ |
| Ban Giám hiệu | Xem | Duyệt | Duyệt | Xem | Duyệt/khóa | Xem | Xem toàn bộ |
| Hội đồng KPI | Xem | Xem | Xem | Xem | Rà soát/chuẩn hóa | Xem | Xem theo phạm vi |
| Trưởng đơn vị | Xem đơn vị | Giao trong đơn vị | Duyệt | Xem | Đánh giá | Xem | Xem đơn vị |
| Cán bộ phụ trách KPI | Nhập/xem | Hỗ trợ giao | Tổng hợp | Kiểm tra | Hỗ trợ đánh giá | Quản lý | Xem đơn vị |
| Giảng viên/nghiên cứu viên/chuyên viên | Xem được giao | Không | Đăng ký/sửa khi nháp | Cập nhật | Tự đánh giá | Tải lên | Xem cá nhân |
| Người kiểm tra minh chứng | Xem | Không | Không | Xác minh | Ghi nhận | Kiểm tra | Xem theo phân công |
| Người xem báo cáo | Xem | Không | Không | Không | Không | Không | Xem theo phân quyền |


| Dashboard | Nội dung theo dõi | Biểu đồ gợi ý |
| --- | --- | --- |
| Ban Giám hiệu | Tổng quan KPI toàn Trường; mức hoàn thành theo lĩnh vực; đơn vị có nguy cơ; xu hướng 3 năm; bản đồ nhiệt | Biểu đồ gauge, cột, đường, heatmap, bảng cảnh báo |
| Trưởng đơn vị | Mức hoàn thành KPI đơn vị; KPI cá nhân; tiến độ minh chứng; so sánh bộ môn/tổ | Cột xếp hạng, bảng tiến độ, heatmap nội bộ |
| Cán bộ phụ trách KPI | Danh sách KPI chờ cập nhật/duyệt; lỗi dữ liệu; thiếu minh chứng; nhật ký xử lý | Bảng công việc, checklist, cảnh báo màu |
| Cá nhân | KPI được giao; tiến độ; minh chứng cần bổ sung; điểm tạm tính; lịch nhắc việc | Thẻ KPI, thanh tiến độ, thông báo |


| Bảng dữ liệu | Mục đích | Trường chính | Quan hệ |
| --- | --- | --- | --- |
| Users | Tài khoản người dùng | user_id, username, full_name, email, org_id, position_id, status | Organizations, Positions, Roles |
| Roles | Vai trò hệ thống | role_id, role_name, description | Users, Permissions |
| Permissions | Quyền chức năng | permission_id, module, action, scope | Roles |
| Organizations | Cơ cấu tổ chức | org_id, parent_id, org_name, org_type, manager_id | Users, KPI_Assignments |
| Positions | Vị trí việc làm/chức danh | position_id, name, group, description | Users |
| KPI_Cycles | Chu kỳ KPI | cycle_id, name, start_date, end_date, status | KPI_Assignments, KPI_Results |
| KPI_Categories | Lĩnh vực KPI | category_id, name, weight, description | KPI_Definitions |
| KPI_Definitions | Danh mục KPI chuẩn | kpi_id, code, name, formula, unit, target, owner_org_id | KPI_Targets, KPI_Assignments |
| KPI_Assignments | Giao KPI | assignment_id, kpi_id, assignee_type, assignee_id, weight, approver_id | KPI_Results |
| KPI_Results | Kết quả KPI | result_id, assignment_id, actual_value, score, status, updated_by | KPI_Evidences, KPI_Approvals |
| KPI_Evidences | Minh chứng số | evidence_id, result_id, file_url, evidence_type, verified_status | KPI_Results |
| KPI_Approvals | Phê duyệt | approval_id, object_type, object_id, approver_id, action, note, created_at | Audit_Logs |
| Notifications | Thông báo/nhắc việc | notification_id, user_id, title, content, status, due_date | Users |
| Audit_Logs | Nhật ký truy vết | log_id, user_id, action, object_type, object_id, timestamp, ip | All modules |
| Integration_Sources | Nguồn tích hợp | source_id, name, type, endpoint, sync_frequency, owner_org_id | KPI_Results |


| Mức xếp loại | Điểm KPI | Ý nghĩa |
| --- | --- | --- |
| Không đạt | < 80 | Chưa hoàn thành chỉ tiêu, cần giải trình và kế hoạch khắc phục |
| Đạt | 80 - <100 | Hoàn thành cơ bản, còn dư địa cải tiến |
| Vượt | 100 - 120 | Vượt chỉ tiêu hoặc hoàn thành với chất lượng cao |
| Xuất sắc | >=120 hoặc theo hội đồng xác nhận | Vượt trội, có tác động rõ ràng, minh chứng đầy đủ |


| Hệ thống tích hợp | Dữ liệu cần lấy | Tần suất | Phương thức | Rủi ro và kiểm soát |
| --- | --- | --- | --- | --- |
| Hệ thống quản lý đào tạo | Tuyển sinh, học phần, SV, tốt nghiệp, tín chỉ | Hàng ngày/tuần | API/ETL/import Excel | Sai lệch mã ngành, mã SV; kiểm tra khóa chính và kỳ dữ liệu |
| Khảo sát người học/người tốt nghiệp | Mức hài lòng, việc làm sau tốt nghiệp, việc làm phù hợp | Theo đợt khảo sát | API/import Excel | Mẫu khảo sát không đủ; kiểm tra tỷ lệ phản hồi và mẫu hợp lệ |
| Quản lý KHCN | Công bố, đề tài, SHTT, doanh thu KHCN | Tháng/quý | API/ETL | Trùng công bố; chuẩn hóa ORCID, Scopus ID, đơn vị chủ trì |
| Nhân sự | Danh sách VC-NLĐ, trình độ, chức danh, vị trí việc làm | Tháng | API/ETL | Biến động nhân sự; đồng bộ mã nhân sự và đơn vị |
| Tài chính | Tổng thu, thu KHCN, chi phí, biên độ hoạt động | Quý/năm | API/ETL/import Excel | Dữ liệu nhạy cảm; phân quyền và đối soát kế toán |
| Eoffice/ký số | Văn bản, trạng thái ký số, luồng xử lý | Hàng ngày | API/webhook | Văn bản ngoài luồng; đối chiếu mã văn bản và trạng thái ký |
| LMS/học trực tuyến | Học phần trực tuyến, tài nguyên, hoạt động học tập | Tuần/tháng | API | Học phần khai báo nhưng chưa đủ nội dung; quy định tiêu chí sẵn sàng |
| Data Warehouse | Kho dữ liệu dùng chung, dữ liệu đã chuẩn hóa | Theo lịch ETL | ETL/API | Chất lượng dữ liệu nguồn; kiểm soát data lineage |


| Lớp kiến trúc | Thành phần đề xuất | Ghi chú |
| --- | --- | --- |
| Frontend Web | React/Vue/Angular | Giao diện cho BGH, đơn vị, cá nhân, hội đồng |
| Backend API | .NET / Java Spring Boot / Node.js | Cung cấp API nghiệp vụ KPI, phân quyền, phê duyệt |
| Database | PostgreSQL / SQL Server / MySQL | Lưu dữ liệu nghiệp vụ, kết quả, phân quyền |
| File/Object Storage | File server / MinIO / S3-compatible | Lưu minh chứng số, tài liệu, báo cáo |
| BI/Dashboard | Metabase / Apache Superset / Power BI | Dashboard điều hành và báo cáo phân tích |
| Integration Service | ETL/API Gateway/Webhook | Đồng bộ dữ liệu từ hệ thống nguồn |
| Authentication | SSO/OAuth2/LDAP/AD | Đăng nhập tập trung, quản lý phiên và vai trò |
| Notification | Email, hệ thống thông báo, lịch nhắc | Nhắc cập nhật, duyệt, thiếu minh chứng |
| Audit & Security | Audit log, backup, encryption, RBAC | Truy vết, bảo mật, sao lưu, phục hồi |


| Hạng mục MVP | Nội dung đề xuất |
| --- | --- |
| Phạm vi | Thí điểm cấp Trường và 5–7 đơn vị đại diện: đào tạo, ĐBCL, KHCN, HTQT, TCCB, tài chính, CNTT/Văn phòng |
| Chức năng tối thiểu | Quản lý chu kỳ; danh mục KPI; giao KPI; đăng ký; cập nhật kết quả; minh chứng; phê duyệt; dashboard; báo cáo |
| Bộ KPI thí điểm | 23 KPI cấp Trường, mỗi KPI có đơn vị chủ trì, công thức, chỉ tiêu, minh chứng và trọng số |
| Dữ liệu chuẩn bị | Cây tổ chức, danh sách người dùng, danh mục KPI, biểu mẫu minh chứng, dữ liệu nền từ Excel/hệ thống nguồn |
| Dashboard thí điểm | Tổng quan toàn Trường, theo lĩnh vực, theo đơn vị, cảnh báo thiếu minh chứng, tiến độ cập nhật |
| Tiêu chí nghiệm thu | 100% KPI được khai báo; 100% đơn vị thí điểm đăng ký; dashboard hoạt động; xuất báo cáo; truy vết đầy đủ; người dùng thí điểm được tập huấn |


| Giai đoạn | Thời gian | Công việc chính | Sản phẩm bàn giao | Rủi ro/kiểm soát |
| --- | --- | --- | --- | --- |
| Giai đoạn 1: MVP và thí điểm | 3–6 tháng | Phân tích chi tiết, chuẩn hóa KPI, xây MVP, import dữ liệu, thí điểm 5–7 đơn vị, tập huấn, đánh giá | Phần mềm MVP, bộ KPI chuẩn, dashboard thí điểm, báo cáo nghiệm thu | Dữ liệu chưa chuẩn; người dùng chưa quen; cần hỗ trợ vận hành sát |
| Giai đoạn 2: Mở rộng toàn Trường | 6–12 tháng | Mở rộng tất cả đơn vị, hoàn thiện phân quyền, báo cáo, quy trình hội đồng, tích hợp một số hệ thống nguồn | Hệ thống KPI toàn Trường, báo cáo kỳ, tích hợp cơ bản | Quy trình khác nhau giữa đơn vị; cần quy chế vận hành và phân công rõ |
| Giai đoạn 3: BI nâng cao và AI Assistant | 12–24 tháng | Xây Data Warehouse, dashboard nâng cao, dự báo, AI Assistant, phân tích rủi ro và khuyến nghị cải tiến | Nền tảng quản trị KPI dựa trên dữ liệu, trợ lý AI, phân tích xu hướng | Rủi ro bảo mật và chất lượng dữ liệu; cần governance, logging, phân quyền dữ liệu |


| Rủi ro | Mức độ | Giải pháp kiểm soát |
| --- | --- | --- |
| Dữ liệu phân tán, không đồng nhất | Cao | Chuẩn hóa mã đơn vị, mã người dùng, mã KPI; thiết lập data owner và quy trình đối soát |
| KPI chưa phản ánh đúng đặc thù đơn vị | Trung bình - cao | Cho phép KPI dùng chung và KPI đặc thù; áp dụng chuẩn hóa theo quy mô và nhiệm vụ |
| Minh chứng không đầy đủ hoặc không kiểm tra được | Cao | Quy định loại minh chứng; kiểm tra định dạng; phân quyền người xác minh; audit log |
| Người dùng ngại thay đổi | Trung bình | Tập huấn, hướng dẫn ngắn gọn, hỗ trợ vận hành, triển khai thí điểm trước |
| Quá tải khi tích hợp nhiều hệ thống cùng lúc | Trung bình | MVP dùng import Excel chuẩn; tích hợp từng nguồn theo ưu tiên |
| Rủi ro bảo mật dữ liệu cá nhân, tài chính, đánh giá | Cao | RBAC, phân vùng dữ liệu, mã hóa, nhật ký truy cập, sao lưu, quy định sử dụng |
| Lạm dụng điểm KPI hoặc chạy theo số lượng | Trung bình | Kết hợp định lượng và định tính; hội đồng chuẩn hóa; kiểm tra minh chứng và tác động thực chất |
