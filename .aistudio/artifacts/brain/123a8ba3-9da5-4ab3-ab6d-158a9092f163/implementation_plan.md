# Robot BiTi – Bạn Đồng Hành Tin Học 3

Ứng dụng web giáo dục đa phương thức toàn diện dành cho học sinh lớp 3, đóng vai trò trợ lý học tập AI thông minh, an toàn, hỗ trợ hỏi đáp bằng văn bản, giọng nói, hình ảnh thực tế và đọc tiếng Việt tự nhiên theo Chương trình GDPT 2018.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Căn cứ phản hồi xác nhận từ người dùng ở Bước 1, các định hướng trọng tâm đã được thống nhất:
> - **Bộ sách giáo khoa trọng tâm**: Ưu tiên mặc định bộ sách **"Kết nối tri thức với cuộc sống"**, đồng thời xây dựng kho dữ liệu mở cho phép giáo viên tra cứu hoặc bổ sung tài liệu của bộ "Cánh diều", "Chân trời sáng tạo" hoặc kế hoạch bài dạy của trường.
> - **Tương tác giọng nói**: Nhận diện giọng nói qua **Web Speech API (vi-VN)** với bộ lọc hiển thị xem lại/gửi nhanh, đi kèm cơ chế **tự động phát giọng đọc tiếng Việt (vi-VN)** có thể bật/tắt linh hoạt và phím điều khiển (Nghe / Dừng / Đọc lại).
> - **Hệ thống luyện tập**: Đa dạng hoá bài tập gồm Trắc nghiệm 4 lựa chọn, Ghép cặp thiết bị & chức năng, Đúng/Sai tình huống an toàn số và Thử thách câu đố nhận diện với hệ thống tích luỹ Sao thưởng động viên.

---

## 1. Overview & Core Concept

- **What It Does**: 
  - Đóng vai trò bạn học AI đáng yêu mang tên Robot BiTi, giải đáp mọi thắc mắc Tin học 3: thiết bị vào/ra, thao tác gõ bàn phím và chuột, an toàn thông tin, thư mục & tệp, ứng dụng học tập số.
  - Hỗ trợ học sinh đặt câu hỏi bằng 3 cách: Gõ văn bản, Bấm micro để nói tiếng Việt, hoặc Chụp/Tải ảnh bài tập, thiết bị để hỏi.
  - Phản hồi bằng tiếng Việt ngắn gọn, chia đoạn rõ ràng, kèm ví dụ gần gũi, hướng dẫn từng bước và giọng đọc ngọt ngào.
  - Tích hợp khu vực "Luyện tập cùng BiTi" với các bài đố vui tương tác, chấm điểm ngay, giải thích vì sao đúng/sai mà không gây áp lực.
  - Trang bị "Góc Giáo Viên / Quản trị tài liệu" cho phép thầy cô xem kho kiến thức chuẩn, cập nhật bài học, kiểm thử câu trả lời và tùy chỉnh cài đặt AI an toàn.

- **Target Audience / Persona**: 
  - Học sinh lớp 3 (8–9 tuổi) tại Việt Nam: Cần giao diện trực quan, chữ to rõ ràng, hình ảnh sống động, dễ tương tác trên cả máy tính lớp học, máy tính bảng và điện thoại.
  - Giáo viên Tin học tiểu học và phụ huynh: Cần một công cụ đồng hành an toàn tuyệt đối, không quảng cáo, bảo mật dữ liệu học sinh, bám sát sách giáo khoa.

- **Key Value**: 
  - Biến các khái niệm công nghệ trừu tượng (thông tin, dữ liệu, phần cứng, phần mềm) thành trải nghiệm hội thoại trực quan, vui vẻ, kích thích tư duy tự khám phá.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Khám phá & Chào hỏi**:
   - Khi vào ứng dụng, Robot BiTi xuất hiện với trạng thái vẫy tay chào và bong bóng lời thoại thân thiện: *"Chào bạn! Mình là Robot BiTi, sẵn sàng cùng bạn khám phá thế giới Tin học 3!"*.
   - Thanh gợi ý câu hỏi nhanh (Ví dụ: "Máy tính gồm những bộ phận nào?", "Bàn phím dùng để làm gì?", "Làm sao bảo vệ mắt khi ngồi máy tính?").
2. **Hỏi đáp đa phương thức**:
   - **Văn bản**: Học sinh gõ câu hỏi tiếng Việt có dấu và nhấn Gửi.
   - **Giọng nói**: Nhấn nút Micro to nổi bật $\to$ BiTi chuyển sang trạng thái "Đang lắng nghe" $\to$ hiển thị chữ học sinh vừa nói để kiểm tra trước khi gửi.
   - **Hình ảnh**: Nhấn biểu tượng Máy ảnh/Tải ảnh $\to$ chọn ảnh bài tập hoặc linh kiện $\to$ ảnh hiện thu nhỏ kèm ô nhập câu hỏi $\to$ gửi BiTi phân tích.
   - **BiTi Suy nghĩ & Trả lời**: BiTi chuyển trạng thái hoạt hình "Đang suy nghĩ" $\to$ hiển thị câu trả lời từng đoạn ngắn $\to$ tự động đọc giọng tiếng Việt nếu bật cờ đọc tự động $\to$ BiTi chuyển trạng thái "Đang nói" với biểu cảm miệng mấp máy dễ thương.
3. **Khu vực Luyện tập & Thử thách**:
   - Học sinh chọn tab "Luyện tập cùng BiTi" $\to$ thử sức với các gói câu hỏi (Nhận diện thiết bị, Thao tác chuột/phím, An toàn Internet, Thông tin quanh ta).
   - Trả lời đúng nhận hiệu ứng chúc mừng vui nhộn + 1 Ngôi sao; trả lời chưa đúng nhận lời khuyên động viên ấm áp từ BiTi để thử lại.
4. **Bảng điều khiển Quản lý Kho tài liệu (Dành cho Giáo viên)**:
   - Giáo viên nhấn nút "Góc Giáo Viên" $\to$ xem các bài học chuẩn Tin học 3 Kết nối tri thức, thêm bài tập mẫu, tải file nội dung bổ sung hoặc kiểm tra bộ quy tắc an toàn.

### Visual Identity & Theme

- **Aesthetic Direction**: Vui nhộn, thân thiện trẻ thơ nhưng bố cục khoa học, hiện đại, chuẩn sư phạm tiểu học (Kid-friendly Tech Companion).
- **Color Palette (Quy tắc 60-30-10)**:
  - *60% Dominant Neutral Canvas*: Nền xanh lam nhạt dịu mắt (`#F0F7FF`) và trắng ngà sạch sẽ (`#FFFFFF`), bảo vệ mắt học sinh.
  - *30% Structural Surfaces*: Thẻ bài học bo góc lớn êm ái, màu xanh da trời robot tươi sáng (`#0284C7`, `#38BDF8`), viền phân cách mỏng (`#BAE6FD`).
  - *10% Focal Accents*: Màu vàng tươi năng lượng của BiTi (`#F59E0B`, `#FBBF24`) cho ngôi sao điểm thưởng và điểm nhấn, xanh lá cây thành công (`#10B981`) cho nút mic và thông báo trả lời đúng.
- **Typography & Hierarchy**:
  - Font chữ: `Plus Jakarta Sans` tròn trịa, thân thiện, độ rõ nét cao, cỡ chữ lớn ($\ge 16\text{px}$ cho nội dung, $18\text{px}$–$24\text{px}$ cho tiêu đề).
  - Tỷ lệ tương phản đạt chuẩn WCAG AA, khoảng cách dòng thoáng ($1.6$) giúp học sinh lớp 3 đọc không bị mỏi mắt.
- **Robot BiTi Character Design**:
  - Nhân vật hoạt hình SVG/Canvas tương tác mượt mà với 5 trạng thái cảm xúc:
    1. *Chào mừng (Greeting)*: Nụ cười rạng rỡ, tay vẫy chào.
    2. *Lắng nghe (Listening)*: Mắt mở to tò mò, tai có sóng âm nhấp nháy.
    3. *Suy nghĩ (Thinking)*: Mắt ngước lên, vòng xoay ánh sáng êm ái quanh ăng-ten.
    4. *Đang nói (Speaking)*: Miệng chuyển động theo nhịp âm thanh, ánh mắt vui vẻ.
    5. *Chúc mừng (Celebrating)*: Vỗ tay, mắt ngôi sao, pháo hoa mini rực rỡ khi học sinh giải đúng.

---

## 3. Key Product Decisions & Trade-Offs

- **Bảo vệ Gemini API Key qua Server Proxy**:
  - *Chosen Approach*: Mọi yêu cầu gọi Gemini API được định tuyến qua máy chủ nội bộ `/api/chat` và `/api/vision`, tuyệt đối không phơi bày `GEMINI_API_KEY` ra mã nguồn trình duyệt của học sinh.
  - *Why*: Đảm bảo an toàn tuyệt đối theo chuẩn bảo mật, ngăn chặn việc trẻ em hoặc người dùng khai thác trái phép khóa bí mật.
- **Kết hợp Nhận diện Web Speech API và Giọng đọc vi-VN linh hoạt**:
  - *Chosen Approach*: Sử dụng Web Speech API chuẩn `vi-VN` của trình duyệt cho thu âm tức thì, kết hợp SpeechSynthesis tiếng Việt đa nền tảng (ưu tiên các voice Google tiếng Việt, Microsoft An/Nam hoặc hệ thống) kèm tùy chọn giọng đọc tự nhiên. Có sẵn nút Nghe lại, Tạm dừng và Tốc độ đọc phù hợp lứa tuổi (0.9x - 1.0x).
  - *Why*: Độ trễ phản hồi âm thanh $\le 100\text{ms}$, không phụ thuộc chi phí gọi Cloud TTS cho mỗi lượt nghe, học sinh có thể nghe đi nghe lại câu trả lời bất kỳ lúc nào mà không bị gián đoạn.
- **Cơ chế Tri thức Chuẩn (Knowledge Retrieval & Grounding)**:
  - *Chosen Approach*: Tích hợp sẵn bộ từ điển bài giảng Tin học 3 chuẩn (Kết nối tri thức với cuộc sống: Chủ đề A đến F). Khi học sinh hỏi, hệ thống tự động đối chiếu ngữ cảnh bài học trước khi truyền vào prompt của Gemini.
  - *Why*: Ngăn ngừa ảo giác AI, đảm bảo câu trả lời luôn đúng thuật ngữ sách giáo khoa lớp 3 (ví dụ: phân biệt rõ "thông tin" và "quyết định", "thiết bị vào" và "thiết bị ra").
- **An toàn học đường (Child Safety & Guardrails)**:
  - *Chosen Approach*: System instructions nghiêm ngặt cấm mọi nội dung không phù hợp, tự động từ chối và khuyên học sinh hỏi thầy cô nếu gặp các câu hỏi tiêu cực hoặc nhạy cảm.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER UI)                           │
│                                                                        │
│  ┌───────────────────────┐ ┌────────────────────────────────────────┐  │
│  │   Robot BiTi Avatar   │ │           Navigation & Stats           │  │
│  │ (Greeting, Listening, │ │  - Sách: Kết nối tri thức             │  │
│  │  Thinking, Speaking)  │ │  - Số Sao: ⭐ | Cài đặt âm thanh       │  │
│  └───────────▲───────────┘ └───────────────────▲────────────────────┘  │
│              │ State synchronization           │                       │
│  ┌───────────┴─────────────────────────────────┴────────────────────┐  │
│  │                      Main Interaction Hub                        │  │
│  │  ┌───────────────────────┐  ┌─────────────────────────────────┐  │  │
│  │  │  Hỏi đáp cùng BiTi    │  │  Luyện tập & Đố vui Tin học 3   │  │  │
│  │  │  - Khung chat song ngữ│  │  - Trắc nghiệm 4 đáp án         │  │  │
│  │  │  - Ghi âm (WebSpeech) │  │  - Ghép thiết bị (Vào / Ra)     │  │  │
│  │  │  - Gửi ảnh chụp/tệp   │  │  - Tình huống an toàn số        │  │  │
│  │  │  - Bộ phát tiếng Việt │  │  - Thưởng sao & giải thích      │  │  │
│  │  └───────────┬───────────┘  └─────────────────────────────────┘  │  │
│  │              │                                                   │  │
│  │  ┌───────────▼───────────┐  ┌─────────────────────────────────┐  │  │
│  │  │ Gợi ý câu hỏi lớp 3   │  │ Góc Giáo Viên (Quản trị nguồn)  │  │  │
│  │  └───────────────────────┘  └─────────────────────────────────┘  │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │ HTTP API calls (Secure)
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         NODE.JS SERVER PROXY                           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  POST /api/chat                                                  │  │
│  │  - Injects System Instruction (Robot BiTi Sư phạm Lớp 3)        │  │
│  │  - Injects Textbook Context (Kết nối tri thức / Giáo viên)       │  │
│  │  - Injects Conversation History & Safety Guardrails              │  │
│  └───────────────────┬──────────────────────────────────────────────┘  │
│                      │                                                 │
│  ┌───────────────────┴──────────────────────────────────────────────┐  │
│  │  POST /api/vision                                                │  │
│  │  - Validates Image base64 + Prompt (bài tập / thiết bị)          │  │
│  │  - Multi-modal inspection via gemini-3.8-flash                   │  │
│  └───────────────────┬──────────────────────────────────────────────┘  │
│                      │ Calls with GEMINI_API_KEY                       │
│                      ▼                                                 │
│         @google/genai SDK (gemini-3.8-flash)                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **Message**: `{ id, role: 'user' | 'assistant', content, timestamp, imageUrl?, audioAutoPlayed? }`
- **BiTiState**: `'greeting' | 'idle' | 'listening' | 'thinking' | 'speaking' | 'celebrating'`
- **TextbookTopic**: Danh mục bài học theo bộ sách:
  - Chủ đề A: Máy tính và em (Thông tin và xử lí thông tin, Khám phá máy tính, Bàn phím & Chuột).
  - Chủ đề B: Mạng máy tính và Internet (Làm quen Internet, An toàn thông tin cá nhân).
  - Chủ đề C: Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin.
  - Chủ đề D: Đạo đức, pháp luật và văn hoá trong môi trường số.
  - Chủ đề E: Ứng dụng tin học (Tập gõ bàn phím, Em vẽ trên máy tính).
  - Chủ đề F: Giải quyết vấn đề với sự trợ giúp của máy tính.
- **QuizQuestion**: `{ id, topic, question, options, answerIndex, explanation, hint, type: 'mcq' | 'matching' | 'scenario' }`
- **TeacherMaterial**: `{ id, title, grade: 3, bookSeries: 'Kết nối tri thức' | 'Cánh diều' | 'Chân trời sáng tạo', topic, content, dateAdded }`
- **AudioSettings**: `{ autoSpeak: true, rate: 0.95, pitch: 1.0, selectedVoiceIndex: 0, isMuted: false }`

---

## 5. Implementation Phases & Deliverables

1. **Phase 1: Backend Server API & Core AI Pipeline**:
   - Khởi tạo endpoint proxy `/api/chat` và `/api/vision` sử dụng `@google/genai` với mô hình chuẩn `gemini-3.8-flash`.
   - Cài đặt System Instruction chuẩn mực sư phạm Tin học 3, lọc ngôn từ, ngắt câu rõ ràng.
   - Xây dựng bộ tri thức nền bám sát SGK Tin học 3 "Kết nối tri thức với cuộc sống".
2. **Phase 2: Robot BiTi Visual Engine & Audio System**:
   - Thiết kế nhân vật Robot BiTi tương tác với 5 trạng thái cảm xúc.
   - Tích hợp Web Speech API tiếng Việt (`vi-VN`) và SpeechSynthesis với các tính năng: Phát, Tạm dừng, Nghe lại, Tự động đọc.
3. **Phase 3: Interactive Chat & Multimodal Image Inspection**:
   - Giao diện khung chat tươi sáng, thẻ gợi ý câu hỏi nhanh, xem trước ảnh bài tập/thiết bị trước khi gửi.
   - Xử lý lỗi thân thiện (mất mạng, từ chối quyền micro, ảnh mờ, câu hỏi ngoài chương trình).
4. **Phase 4: Khu vực Luyện tập & Đố vui có thưởng sao**:
   - Trắc nghiệm Tin học 3 với giải thích chi tiết vì sao đúng/sai.
   - Thử thách ghép nối thiết bị Vào/Ra.
   - Câu đố tình huống an toàn khi dùng Internet.
5. **Phase 5: Góc Giáo viên & Kiểm thử toàn diện**:
   - Trình xem và thêm tài liệu học tập của giáo viên.
   - Kiểm thử 12 tình huống nghiệm thu (văn bản, giọng nói, ảnh bài tập, dừng âm thanh, câu hỏi liên tiếp, ngoài phạm vi, responsive mobile/desktop).
