import { TextbookTopic, QuizQuestion, BookSeries } from '../types';

export const BOOK_SERIES_LABELS: Record<BookSeries, string> = {
  ket_noi_tri_thuc: 'Kết nối tri thức với cuộc sống (Bộ chuẩn GDPT 2018)',
  canh_dieu: 'Cánh diều',
  chan_troi_sang_tao: 'Chân trời sáng tạo',
};

export const GRADE_3_TOPICS: TextbookTopic[] = [
  {
    id: 'topic_a',
    code: 'Chủ đề A',
    title: 'Máy tính và em',
    description: 'Tìm hiểu về thông tin, các bộ phận của máy tính, tư thế ngồi đúng, thao tác với bàn phím và chuột máy tính.',
    lessons: [
      {
        number: 1,
        title: 'Thông tin và quyết định',
        keyPoints: [
          'Thông tin là những hiểu biết về thế giới xung quanh (âm thanh, hình ảnh, chữ viết, mùi vị, màu sắc...).',
          'Con người tiếp nhận thông tin từ các giác quan (mắt thấy, tai nghe, mũi ngửi...).',
          'Sau khi có thông tin, con người suy nghĩ và đưa ra quyết định hành động phù hợp (ví dụ: nghe tiếng trống vào lớp, em đi vào phòng học).'
        ],
        sampleQuestions: [
          'Thông tin là gì?',
          'Tiếng còi xe cứu thương là loại thông tin gì và giúp em quyết định ra sao?',
          'Em nhận biết biển báo đèn đỏ bằng giác quan nào?'
        ]
      },
      {
        number: 2,
        title: 'Xử lí thông tin',
        keyPoints: [
          'Não của con người là bộ phận thu nhận và xử lí thông tin để đưa ra quyết định.',
          'Các bước xử lí thông tin: 1. Thu nhận thông tin -> 2. Xử lí thông tin -> 3. Ra quyết định / kết quả.',
          'Máy tính cũng có thể thu nhận thông tin, xử lí thông tin và xuất ra kết quả rất nhanh.'
        ],
        sampleQuestions: [
          'Bộ phận nào trong cơ thể con người xử lí thông tin?',
          'Máy tính xử lí thông tin như thế nào?'
        ]
      },
      {
        number: 3,
        title: 'Máy tính – Người bạn mới của em',
        keyPoints: [
          'Máy tính để bàn gồm 4 bộ phận cơ bản: Thân máy, Màn hình, Bàn phím và Chuột.',
          'Thân máy tính chứa "bộ não" (bộ vi xử lí CPU) điều khiển mọi hoạt động của máy tính.',
          'Màn hình hiển thị kết quả làm việc của máy tính (chữ, hình ảnh, video).',
          'Bàn phím và chuột giúp gửi thông tin và lệnh từ người dùng vào máy tính.',
          'Ngoài máy tính để bàn, còn có máy tính xách tay (laptop) và máy tính bảng.'
        ],
        sampleQuestions: [
          'Máy tính để bàn gồm những bộ phận cơ bản nào?',
          'Bộ phận nào của máy tính được ví như bộ não?',
          'Màn hình máy tính có chức năng gì?'
        ]
      },
      {
        number: 4,
        title: 'Làm việc với máy tính',
        keyPoints: [
          'Tư thế ngồi đúng: Lưng thẳng, hai chân đặt thoải mái trên sàn, mắt nhìn ngang hoặc hơi thấp hơn mép trên màn hình.',
          'Khoảng cách từ mắt đến màn hình máy tính an toàn là từ 50 cm đến 80 cm (khoảng một sải tay trẻ em).',
          'Ánh sáng phòng học phải đủ sáng, không để ánh sáng chiếu thẳng vào màn hình làm chói mắt.',
          'Không ngồi máy tính liên tục quá 30 - 45 phút, nên nghỉ ngơi và tập thể dục cho mắt.',
          'Không tự ý chạm vào dây điện, ổ cắm hay tháo lắp các bộ phận máy tính.'
        ],
        sampleQuestions: [
          'Ngồi học máy tính như thế nào là đúng tư thế?',
          'Khoảng cách từ mắt đến màn hình bao nhiêu là an toàn?',
          'Quy tắc an toàn điện trong phòng tin học là gì?'
        ]
      },
      {
        number: 5,
        title: 'Sử dụng bàn phím máy tính',
        keyPoints: [
          'Bàn phím máy tính gồm khu vực phím chính, các phím số và phím chức năng.',
          'Khu vực phím chính có 5 hàng phím: Hàng phím số, Hàng phím trên, Hàng phím cơ sở, Hàng phím dưới, Hàng phím dưới cùng.',
          'Hàng phím cơ sở có hai phím có gờ là F và J. Đây là nơi đặt hai ngón tay trỏ khi bắt đầu gõ phím.',
          'Các phím đặc biệt quan trọng: Phím Space (phím cách dài nhất), phím Enter (xuống dòng), phím Shift (gõ chữ hoa và ký hiệu trên), phím Backspace (xoá ký tự bên trái con trỏ), phím Caps Lock (khoá chữ hoa).'
        ],
        sampleQuestions: [
          'Hai phím nào trên hàng phím cơ sở có gờ nổi?',
          'Phím dài nhất trên bàn phím có tên là gì và dùng để làm gì?',
          'Phím Enter dùng để làm gì?'
        ]
      },
      {
        number: 6,
        title: 'Sử dụng chuột máy tính',
        keyPoints: [
          'Chuột máy tính thông thường có nút trái, nút phải và bánh lăn (nút cuộn).',
          'Cách cầm chuột đúng: Đặt tay phải tự nhiên lên chuột, ngón trỏ đặt lên nút trái, ngón giữa đặt lên nút phải, ngón cái và các ngón còn lại giữ hai bên thân chuột.',
          '5 thao tác cơ bản với chuột: 1. Di chuyển chuột, 2. Nháy chuột (bấm nút trái 1 lần), 3. Nháy đúp chuột (bấm nút trái nhanh 2 lần liên tiếp), 4. Nháy nút phải (bấm nút phải 1 lần), 5. Kéo thả chuột (nhấn giữ nút trái, di chuyển đến vị trí mới rồi thả tay).'
        ],
        sampleQuestions: [
          'Cách cầm chuột máy tính đúng như thế nào?',
          'Nháy đúp chuột là thao tác như thế nào?',
          'Bánh lăn ở giữa hai nút chuột dùng để làm gì?'
        ]
      }
    ]
  },
  {
    id: 'topic_b',
    code: 'Chủ đề B',
    title: 'Mạng máy tính và Internet',
    description: 'Làm quen với mạng Internet, lợi ích của Internet và bảo vệ an toàn thông tin cá nhân.',
    lessons: [
      {
        number: 7,
        title: 'Khám phá Internet',
        keyPoints: [
          'Internet là mạng kết nối hàng triệu máy tính trên toàn thế giới với nhau.',
          'Internet là kho thông tin khổng lồ giúp em: Xem tin tức học tập, xem bài giảng, nghe nhạc thiếu nhi, xem phim hoạt hình, trò chuyện cùng người thân ở xa.',
          'Chỉ nên truy cập Internet khi có sự đồng ý và hướng dẫn của thầy cô hoặc cha mẹ.'
        ],
        sampleQuestions: [
          'Internet là gì?',
          'Internet giúp ích gì cho việc học của học sinh tiểu học?'
        ]
      },
      {
        number: 8,
        title: 'Bảo vệ thông tin cá nhân trên mạng',
        keyPoints: [
          'Thông tin cá nhân bao gồm: Họ và tên đầy đủ, ngày sinh, địa chỉ nhà, số điện thoại, trường lớp học, ảnh riêng tư và mật khẩu tài khoản.',
          'Quy tắc vàng: Tuyệt đối KHÔNG chia sẻ thông tin cá nhân với người lạ trên Internet.',
          'Không bấm vào các đường link lạ, quà tặng ảo không rõ nguồn gốc.',
          'Nếu gặp điều gì lạ, đáng sợ hoặc bị ai đó làm phiền trên mạng, hãy báo ngay cho cha mẹ hoặc thầy cô giáo.'
        ],
        sampleQuestions: [
          'Những thông tin nào là thông tin cá nhân cần bảo mật?',
          'Nếu có người lạ trên mạng hỏi địa chỉ nhà của em, em phải làm gì?'
        ]
      }
    ]
  },
  {
    id: 'topic_c',
    code: 'Chủ đề C',
    title: 'Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin',
    description: 'Hiểu về tệp, thư mục và cách sắp xếp thông tin khoa học trong máy tính.',
    lessons: [
      {
        number: 9,
        title: 'Tệp và thư mục trong máy tính',
        keyPoints: [
          'Trong máy tính, thông tin được lưu trữ dưới dạng các tệp (tệp văn bản, tệp hình ảnh, tệp âm thanh, video).',
          'Thư mục giống như một chiếc ngăn kéo hay chiếc cặp sách, dùng để chứa các tệp hoặc thư mục con.',
          'Thư mục giúp sắp xếp các tệp tài liệu ngăn nắp, dễ tìm kiếm khi cần dùng.',
          'Biểu tượng của thư mục thường có màu vàng hình chiếc kẹp tài liệu.'
        ],
        sampleQuestions: [
          'Thư mục trong máy tính có tác dụng gì?',
          'Làm thế nào để phân biệt tệp và thư mục?'
        ]
      }
    ]
  },
  {
    id: 'topic_d',
    code: 'Chủ đề D',
    title: 'Đạo đức, pháp luật và văn hoá trong môi trường số',
    description: 'Ứng xử lịch sự, văn minh và tôn trọng bản quyền khi sử dụng công nghệ.',
    lessons: [
      {
        number: 10,
        title: 'Ứng xử văn minh khi sử dụng công nghệ',
        keyPoints: [
          'Lời nói khi trao đổi trên mạng phải lịch sự, thân thiện, lễ phép với người lớn.',
          'Không xúc phạm, trêu chọc hay lan truyền những điều không đúng về bạn bè.',
          'Tôn trọng bản quyền: Khi sử dụng bài viết, tranh ảnh của người khác, cần xin phép hoặc ghi rõ nguồn tác giả.'
        ],
        sampleQuestions: [
          'Thế nào là ứng xử văn minh trong môi trường số?',
          'Em có được tự ý lấy tranh vẽ của bạn trên mạng về nộp làm bài của mình không?'
        ]
      }
    ]
  },
  {
    id: 'topic_e',
    code: 'Chủ đề E',
    title: 'Ứng dụng tin học',
    description: 'Thực hành tập gõ bàn phím và sử dụng phần mềm đồ họa Paint để vẽ tranh.',
    lessons: [
      {
        number: 11,
        title: 'Em tập gõ bàn phím đúng cách',
        keyPoints: [
          'Gõ 10 ngón giúp gõ nhanh, chính xác và không mỏi tay.',
          'Tư thế khởi hành: 8 ngón tay đặt nhẹ nhàng lên 8 phím xuất phát trên hàng phím cơ sở (A, S, D, F và J, K, L, ;).',
          'Hai ngón tay cái chuyên dùng để gõ phím Cách (Space).',
          'Mỗi ngón tay phụ trách một số phím nhất định.'
        ],
        sampleQuestions: [
          '8 phím xuất phát trên hàng phím cơ sở là những phím nào?',
          'Ngón tay nào dùng để nhấn phím Cách?'
        ]
      },
      {
        number: 12,
        title: 'Em tập vẽ với phần mềm Paint',
        keyPoints: [
          'Phần mềm Paint là công cụ giúp em vẽ tranh và tô màu trên máy tính.',
          'Vùng công cụ chính: Bút vẽ (Brushes), Tẩy (Eraser), Thùng sơn tô màu (Fill with color), Hộp hình mẫu (Shapes), Bảng màu (Color Palette).',
          'Các bước vẽ hình cơ bản: 1. Chọn hình mẫu (hình tròn, chữ nhật...) -> 2. Chọn màu nét vẽ -> 3. Kéo thả chuột trên vùng vẽ.'
        ],
        sampleQuestions: [
          'Công cụ nào trong Paint dùng để tô kín màu cho hình vẽ?',
          'Khi vẽ nhầm nét, em dùng công cụ gì để sửa lại?'
        ]
      }
    ]
  },
  {
    id: 'topic_f',
    code: 'Chủ đề F',
    title: 'Giải quyết vấn đề với sự trợ giúp của máy tính',
    description: 'Rèn luyện tư duy logic: chia việc lớn thành việc nhỏ và thực hiện theo từng bước.',
    lessons: [
      {
        number: 13,
        title: 'Chia việc lớn thành việc nhỏ',
        keyPoints: [
          'Để giải quyết một công việc lớn hay bài toán khó, ta nên chia thành các bước nhỏ hơn và giải quyết từng bước một.',
          'Ví dụ: Chuẩn bị sách vở đi học gồm các bước: 1. Xem thời khoá biểu -> 2. Lấy sách vở theo từng môn -> 3. Xếp gọn gàng vào cặp.',
          'Máy tính cũng thực hiện các công việc phức tạp theo từng lệnh nhỏ tuần tự.'
        ],
        sampleQuestions: [
          'Tại sao cần chia việc lớn thành việc nhỏ?',
          'Các bước để giải một bài toán đố là gì?'
        ]
      }
    ]
  }
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    topicId: 'topic_a',
    type: 'mcq',
    title: 'Các bộ phận cơ bản của máy tính',
    question: 'Máy tính để bàn thông thường gồm những bộ phận cơ bản nào sau đây?',
    options: [
      'Thân máy, Màn hình, Bàn phím và Chuột',
      'Thân máy, Loa, Máy in và Bàn phím',
      'Màn hình, Chuột, Tai nghe và Micro',
      'Bàn phím, Chuột, Webcam và USB'
    ],
    correctAnswer: 0,
    explanation: 'Chính xác! Máy tính để bàn gồm 4 bộ phận cơ bản không thể thiếu: Thân máy (bộ não xử lí), Màn hình (hiển thị), Bàn phím (nhập chữ/số) và Chuột (điều khiển).',
    hint: 'Hãy nhớ lại 4 người bạn thân thiết luôn có mặt trên bàn học vi tính nhé!'
  },
  {
    id: 'q2',
    topicId: 'topic_a',
    type: 'mcq',
    title: 'Hàng phím cơ sở và phím có gờ',
    question: 'Trên bàn phím máy tính, hai phím nào trên hàng phím cơ sở có gờ nổi để đặt ngón trỏ?',
    options: [
      'Phím A và Phím L',
      'Phím F và Phím J',
      'Phím G và Phím H',
      'Phím D và Phím K'
    ],
    correctAnswer: 1,
    explanation: 'Tuyệt vời! Hai phím F và J trên hàng phím cơ sở có gờ nổi giúp các ngón tay của em định vị chính xác vị trí xuất phát mà không cần nhìn xuống bàn phím.',
    hint: 'Hai phím này nằm ngay chính giữa của hàng phím cơ sở và có chấm gờ nhỏ bên dưới.'
  },
  {
    id: 'q3',
    topicId: 'topic_a',
    type: 'mcq',
    title: 'Tư thế ngồi an toàn với máy tính',
    question: 'Khoảng cách an toàn từ mắt học sinh đến màn hình máy tính nên là bao nhiêu?',
    options: [
      'Khoảng 10 cm đến 20 cm (thật gần)',
      'Khoảng 50 cm đến 80 cm (khoảng một sải tay)',
      'Khoảng 2 mét đến 3 mét (thật xa)',
      'Ngồi sát màn hình để nhìn cho rõ'
    ],
    correctAnswer: 1,
    explanation: 'Rất chuẩn! Khoảng cách 50 cm đến 80 cm (tương đương một sải tay) giúp bảo vệ thị lực của em, tránh mỏi mắt và cận thị khi học tập.',
    hint: 'Em thử đưa thẳng cánh tay ra, đầu ngón tay chạm nhẹ vào màn hình là khoảng cách lý tưởng đấy!'
  },
  {
    id: 'q4',
    topicId: 'topic_b',
    type: 'true_false',
    title: 'Bảo vệ thông tin cá nhân trên Internet',
    question: 'Khi một người lạ trên mạng Internet hỏi số điện thoại và địa chỉ nhà của em để gửi quà tặng, em nên lập tức cung cấp thông tin cho họ.',
    options: ['Đúng', 'Sai'],
    correctAnswer: 1, // Sai
    explanation: 'Chính xác! Tuyệt đối KHÔNG chia sẻ địa chỉ nhà, số điện thoại hay thông tin trường lớp cho người lạ trên mạng. Khi có người hỏi, em hãy báo ngay cho cha mẹ hoặc thầy cô nhé!',
    hint: 'Thông tin cá nhân là bí mật an toàn cần được bảo vệ cẩn thận.'
  },
  {
    id: 'q5',
    topicId: 'topic_a',
    type: 'matching',
    title: 'Ghép bộ phận máy tính với chức năng tương ứng',
    question: 'Hãy nối các bộ phận của máy tính với chức năng chính xác của chúng:',
    pairs: [
      { item: 'Bàn phím máy tính', match: 'Nhập chữ, số và các ký hiệu vào máy tính' },
      { item: 'Màn hình máy tính', match: 'Hiển thị hình ảnh, chữ viết và kết quả làm việc' },
      { item: 'Chuột máy tính', match: 'Giúp điều khiển con trỏ và đưa ra các lệnh nhanh chóng' },
      { item: 'Thân máy tính', match: 'Chứa bộ vi xử lí CPU điều khiển mọi hoạt động' }
    ],
    correctAnswer: {
      'Bàn phím máy tính': 'Nhập chữ, số và các ký hiệu vào máy tính',
      'Màn hình máy tính': 'Hiển thị hình ảnh, chữ viết và kết quả làm việc',
      'Chuột máy tính': 'Giúp điều khiển con trỏ và đưa ra các lệnh nhanh chóng',
      'Thân máy tính': 'Chứa bộ vi xử lí CPU điều khiển mọi hoạt động'
    },
    explanation: 'Giỏi lắm! Mỗi bộ phận của máy tính đều đảm nhận một nhiệm vụ riêng biệt và kết hợp nhịp nhàng với nhau giống như các giác quan trên cơ thể con người vậy!',
    hint: 'Màn hình giúp mắt nhìn, bàn phím giúp gõ chữ, chuột giúp di chuyển, thân máy là đầu não suy nghĩ.'
  },
  {
    id: 'q6',
    topicId: 'topic_c',
    type: 'mcq',
    title: 'Tệp và thư mục trong máy tính',
    question: 'Trong máy tính, biểu tượng có màu vàng hình chiếc kẹp tài liệu thường biểu thị cho điều gì?',
    options: [
      'Một bài hát (tệp âm thanh)',
      'Một thư mục (Folder) dùng để chứa các tệp',
      'Một trò chơi điện tử',
      'Một đoạn phim hoạt hình'
    ],
    correctAnswer: 1,
    explanation: 'Hoan hô! Thư mục (Folder) có biểu tượng màu vàng hình kẹp tài liệu, bên trong có thể chứa nhiều tệp tài liệu và các thư mục con khác.',
    hint: 'Chiếc kẹp tài liệu màu vàng giống như một chiếc ngăn kéo đựng nhiều vở bài tập.'
  },
  {
    id: 'q7',
    topicId: 'topic_e',
    type: 'mcq',
    title: 'Phần mềm đồ họa Paint',
    question: 'Trong phần mềm Paint, khi muốn tô kín màu cho một hình tròn đã khép kín, em sử dụng công cụ nào?',
    options: [
      'Công cụ Tẩy (Eraser)',
      'Công cụ Thùng sơn (Fill with color)',
      'Công cụ Bút chì (Pencil)',
      'Công cụ Chọn vùng (Select)'
    ],
    correctAnswer: 1,
    explanation: 'Chính xác! Công cụ Thùng sơn (Fill with color) giúp em đổ màu nhanh và đều vào bất kỳ hình vẽ nào đã được vẽ khép kín nét viền.',
    hint: 'Tìm biểu tượng chiếc xô đang đổ dòng sơn màu xuống nhé!'
  }
];

export const QUICK_SUGGESTIONS = [
  'Máy tính có những bộ phận nào?',
  'Bàn phím dùng để làm gì?',
  'Chuột máy tính giúp chúng ta làm gì?',
  'Thông tin là gì?',
  'Làm thế nào để sử dụng máy tính an toàn?',
  'BiTi giúp con giải bài tập này nhé!'
];
