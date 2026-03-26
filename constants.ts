import { Category, FileMetadata } from './types';

// Kategori Standar (Adobe Stock)
export const CATEGORIES: Category[] = [
  { id: '1', en: 'Animals', id_lang: 'Hewan' },
  { id: '2', en: 'Buildings and Architecture', id_lang: 'Bangunan & Arsitektur' },
  { id: '3', en: 'Business', id_lang: 'Bisnis' },
  { id: '4', en: 'Drinks', id_lang: 'Minuman' },
  { id: '5', en: 'The Environment', id_lang: 'Lingkungan' },
  { id: '6', en: 'States of Mind', id_lang: 'Perasaan & Emosi' },
  { id: '7', en: 'Food', id_lang: 'Makanan' },
  { id: '8', en: 'Graphic Resources', id_lang: 'Sumber Grafis' },
  { id: '9', en: 'Hobbies and Leisure', id_lang: 'Hobi & Liburan' },
  { id: '10', en: 'Industry', id_lang: 'Industri' },
  { id: '11', en: 'Landscapes', id_lang: 'Pemandangan' },
  { id: '12', en: 'Lifestyle', id_lang: 'Gaya Hidup' },
  { id: '13', en: 'People', id_lang: 'Orang' },
  { id: '14', en: 'Plants and Flowers', id_lang: 'Tanaman & Bunga' },
  { id: '15', en: 'Culture and Religion', id_lang: 'Budaya & Agama' },
  { id: '16', en: 'Science', id_lang: 'Sains' },
  { id: '17', en: 'Social Issues', id_lang: 'Isu Sosial' },
  { id: '18', en: 'Sports', id_lang: 'Olahraga' },
  { id: '19', en: 'Technology', id_lang: 'Teknologi' },
  { id: '20', en: 'Transport', id_lang: 'Transportasi' },
  { id: '21', en: 'Travel', id_lang: 'Wisata' },
];

// Kategori Shutterstock (ID sudah berupa TEKS/KATA, bukan angka)
export const SHUTTERSTOCK_CATEGORIES: Category[] = [
  { id: 'Abstract', en: 'Abstract', id_lang: 'Abstrak' },
  { id: 'Animals/Wildlife', en: 'Animals/Wildlife', id_lang: 'Hewan/Margasatwa' },
  { id: 'Arts', en: 'Arts', id_lang: 'Seni' },
  { id: 'Backgrounds/Textures', en: 'Backgrounds/Textures', id_lang: 'Latar Belakang/Tekstur' },
  { id: 'Beauty/Fashion', en: 'Beauty/Fashion', id_lang: 'Kecantikan/Fashion' },
  { id: 'Buildings/Landmarks', en: 'Buildings/Landmarks', id_lang: 'Bangunan/Landmark' },
  { id: 'Business/Finance', en: 'Business/Finance', id_lang: 'Bisnis/Keuangan' },
  { id: 'Celebrities', en: 'Celebrities', id_lang: 'Selebriti' },
  { id: 'Education', en: 'Education', id_lang: 'Pendidikan' },
  { id: 'Food and drink', en: 'Food and drink', id_lang: 'Makanan dan Minuman' },
  { id: 'Healthcare/Medical', en: 'Healthcare/Medical', id_lang: 'Kesehatan/Medis' },
  { id: 'Holidays', en: 'Holidays', id_lang: 'Hari Libur' },
  { id: 'Industrial', en: 'Industrial', id_lang: 'Industri' },
  { id: 'Interiors', en: 'Interiors', id_lang: 'Interior' },
  { id: 'Miscellaneous', en: 'Miscellaneous', id_lang: 'Lain-lain' },
  { id: 'Nature', en: 'Nature', id_lang: 'Alam' },
  { id: 'Parks/Outdoor', en: 'Parks/Outdoor', id_lang: 'Taman/Luar Ruangan' },
  { id: 'People', en: 'People', id_lang: 'Orang' },
  { id: 'Religion', en: 'Religion', id_lang: 'Agama' },
  { id: 'Science', en: 'Science', id_lang: 'Sains' },
  { id: 'Signs/Symbols', en: 'Signs/Symbols', id_lang: 'Tanda/Simbol' },
  { id: 'Sports/Recreation', en: 'Sports/Recreation', id_lang: 'Olahraga/Rekreasi' },
  { id: 'Technology', en: 'Technology', id_lang: 'Teknologi' },
  { id: 'Transportation', en: 'Transportation', id_lang: 'Transportasi' },
  { id: 'Vintage', en: 'Vintage', id_lang: 'Vintage' },
];

// === KATEGORI KHUSUS VIDEO SHUTTERSTOCK ===
export const SHUTTERSTOCK_VIDEO_CATEGORIES: Category[] = [
  { id: 'Animals/Wildlife', en: 'Animals/Wildlife', id_lang: 'Hewan/Satwa Liar' },
  { id: 'Arts', en: 'Arts', id_lang: 'Seni' },
  { id: 'Backgrounds/Textures', en: 'Backgrounds/Textures', id_lang: 'Latar Belakang/Tekstur' },
  { id: 'Buildings/Landmarks', en: 'Buildings/Landmarks', id_lang: 'Bangunan/Tengara' },
  { id: 'Business/Finance', en: 'Business/Finance', id_lang: 'Bisnis/Keuangan' },
  { id: 'Education', en: 'Education', id_lang: 'Pendidikan' },
  { id: 'Food and drink', en: 'Food and drink', id_lang: 'Makanan dan Minuman' },
  { id: 'Healthcare/Medical', en: 'Healthcare/Medical', id_lang: 'Kesehatan/Medis' },
  { id: 'Holidays', en: 'Holidays', id_lang: 'Liburan' },
  { id: 'Industrial', en: 'Industrial', id_lang: 'Industri' },
  { id: 'Nature', en: 'Nature', id_lang: 'Alam' },
  { id: 'Objects', en: 'Objects', id_lang: 'Objek' },
  { id: 'People', en: 'People', id_lang: 'Orang' },
  { id: 'Religion', en: 'Religion', id_lang: 'Agama' },
  { id: 'Science', en: 'Science', id_lang: 'Sains' },
  { id: 'Signs/Symbols', en: 'Signs/Symbols', id_lang: 'Tanda/Simbol' },
  { id: 'Sports/Recreation', en: 'Sports/Recreation', id_lang: 'Olahraga/Rekreasi' },
  { id: 'Technology', en: 'Technology', id_lang: 'Teknologi' },
  { id: 'Transportation', en: 'Transportation', id_lang: 'Transportasi' }
];

// === KAMUS MASTER DREAMSTIME (IMAGE & VIDEO UNIVERSAL) ===
// Disesuaikan persis dari File Legend CSV
export const DREAMSTIME_CATEGORIES: Category[] = [
  { id: '211', en: 'Abstract -> Aerial', id_lang: 'Abstrak -> Udara' },
  { id: '112', en: 'Abstract -> Backgrounds', id_lang: 'Abstrak -> Latar Belakang' },
  { id: '39', en: 'Abstract -> Blurs', id_lang: 'Abstrak -> Blur' },
  { id: '164', en: 'Abstract -> Colors', id_lang: 'Abstrak -> Warna' },
  { id: '40', en: 'Abstract -> Competition', id_lang: 'Abstrak -> Kompetisi' },
  { id: '41', en: 'Abstract -> Craftsmanship', id_lang: 'Abstrak -> Kerajinan' },
  { id: '42', en: 'Abstract -> Danger', id_lang: 'Abstrak -> Bahaya' },
  { id: '43', en: 'Abstract -> Exploration', id_lang: 'Abstrak -> Eksplorasi' },
  { id: '158', en: 'Abstract -> Fun', id_lang: 'Abstrak -> Kesenangan' },
  { id: '44', en: 'Abstract -> Help', id_lang: 'Abstrak -> Bantuan' },
  { id: '149', en: 'Abstract -> Love', id_lang: 'Abstrak -> Cinta' },
  { id: '45', en: 'Abstract -> Luxury', id_lang: 'Abstrak -> Kemewahan' },
  { id: '187', en: 'Abstract -> Mobile', id_lang: 'Abstrak -> Seluler' },
  { id: '46', en: 'Abstract -> Peace', id_lang: 'Abstrak -> Kedamaian' },
  { id: '165', en: 'Abstract -> Planetarium', id_lang: 'Abstrak -> Planetarium' },
  { id: '47', en: 'Abstract -> Power', id_lang: 'Abstrak -> Kekuatan' },
  { id: '48', en: 'Abstract -> Purity', id_lang: 'Abstrak -> Kemurnian' },
  { id: '128', en: 'Abstract -> Religion', id_lang: 'Abstrak -> Agama' },
  { id: '155', en: 'Abstract -> Seasonal & Holiday', id_lang: 'Abstrak -> Musiman & Liburan' },
  { id: '49', en: 'Abstract -> Security', id_lang: 'Abstrak -> Keamanan' },
  { id: '50', en: 'Abstract -> Sports', id_lang: 'Abstrak -> Olahraga' },
  { id: '51', en: 'Abstract -> Stress', id_lang: 'Abstrak -> Stres' },
  { id: '52', en: 'Abstract -> Success', id_lang: 'Abstrak -> Kesuksesan' },
  { id: '53', en: 'Abstract -> Teamwork', id_lang: 'Abstrak -> Kerja Tim' },
  { id: '141', en: 'Abstract -> Textures', id_lang: 'Abstrak -> Tekstur' },
  { id: '54', en: 'Abstract -> Unique', id_lang: 'Abstrak -> Unik' },
  { id: '31', en: 'Animals -> Birds', id_lang: 'Hewan -> Burung' },
  { id: '33', en: 'Animals -> Farm', id_lang: 'Hewan -> Peternakan' },
  { id: '36', en: 'Animals -> Insects', id_lang: 'Hewan -> Serangga' },
  { id: '32', en: 'Animals -> Mammals', id_lang: 'Hewan -> Mamalia' },
  { id: '34', en: 'Animals -> Marine life', id_lang: 'Hewan -> Biota Laut' },
  { id: '30', en: 'Animals -> Pets', id_lang: 'Hewan -> Peliharaan' },
  { id: '35', en: 'Animals -> Reptiles & Amphibians', id_lang: 'Hewan -> Reptil & Amfibi' },
  { id: '37', en: 'Animals -> Rodents', id_lang: 'Hewan -> Hewan Pengerat' },
  { id: '168', en: 'Animals -> Wildlife', id_lang: 'Hewan -> Satwa Liar' },
  { id: '124', en: 'Arts & Architecture -> Details', id_lang: 'Seni & Arsitektur -> Detail' },
  { id: '71', en: 'Arts & Architecture -> Generic architecture', id_lang: 'Seni & Arsitektur -> Arsitektur Umum' },
  { id: '132', en: 'Arts & Architecture -> Historic buildings', id_lang: 'Seni & Arsitektur -> Bangunan Bersejarah' },
  { id: '153', en: 'Arts & Architecture -> Home', id_lang: 'Seni & Arsitektur -> Rumah' },
  { id: '73', en: 'Arts & Architecture -> Indoor', id_lang: 'Seni & Arsitektur -> Dalam Ruangan' },
  { id: '70', en: 'Arts & Architecture -> Landmarks', id_lang: 'Seni & Arsitektur -> Tengara' },
  { id: '131', en: 'Arts & Architecture -> Modern buildings', id_lang: 'Seni & Arsitektur -> Bangunan Modern' },
  { id: '130', en: 'Arts & Architecture -> Night scenes', id_lang: 'Seni & Arsitektur -> Pemandangan Malam' },
  { id: '72', en: 'Arts & Architecture -> Outdoor', id_lang: 'Seni & Arsitektur -> Luar Ruangan' },
  { id: '174', en: 'Arts & Architecture -> Ruins & Ancient', id_lang: 'Seni & Arsitektur -> Reruntuhan & Kuno' },
  { id: '154', en: 'Arts & Architecture -> Work places', id_lang: 'Seni & Arsitektur -> Tempat Kerja' },
  { id: '79', en: 'Business -> Communications', id_lang: 'Bisnis -> Komunikasi' },
  { id: '78', en: 'Business -> Computers', id_lang: 'Bisnis -> Komputer' },
  { id: '80', en: 'Business -> Finance', id_lang: 'Bisnis -> Keuangan' },
  { id: '77', en: 'Business -> Industries', id_lang: 'Bisnis -> Industri' },
  { id: '83', en: 'Business -> Metaphors', id_lang: 'Bisnis -> Metafora' },
  { id: '84', en: 'Business -> Objects', id_lang: 'Bisnis -> Objek' },
  { id: '75', en: 'Business -> People', id_lang: 'Bisnis -> Orang' },
  { id: '81', en: 'Business -> Still-life', id_lang: 'Bisnis -> Benda Mati' },
  { id: '76', en: 'Business -> Teams', id_lang: 'Bisnis -> Tim' },
  { id: '82', en: 'Business -> Transportation', id_lang: 'Bisnis -> Transportasi' },
  { id: '85', en: 'Business -> Travel', id_lang: 'Bisnis -> Wisata' },
  { id: '178', en: 'Editorial -> Celebrities', id_lang: 'Editorial -> Selebriti' },
  { id: '185', en: 'Editorial -> Commercial', id_lang: 'Editorial -> Komersial' },
  { id: '179', en: 'Editorial -> Events', id_lang: 'Editorial -> Acara' },
  { id: '184', en: 'Editorial -> Landmarks', id_lang: 'Editorial -> Landmark' },
  { id: '180', en: 'Editorial -> People', id_lang: 'Editorial -> Orang' },
  { id: '181', en: 'Editorial -> Politics', id_lang: 'Editorial -> Politik' },
  { id: '182', en: 'Editorial -> Sports', id_lang: 'Editorial -> Olahraga' },
  { id: '183', en: 'Editorial -> Weather & Environment', id_lang: 'Editorial -> Cuaca & Lingkungan' },
  { id: '204', en: 'Holidays -> Chinese New Year', id_lang: 'Liburan -> Tahun Baru Imlek' },
  { id: '190', en: 'Holidays -> Christmas', id_lang: 'Liburan -> Natal' },
  { id: '207', en: 'Holidays -> Cinco de Mayo', id_lang: 'Liburan -> Cinco de Mayo' },
  { id: '203', en: 'Holidays -> Diwali', id_lang: 'Liburan -> Diwali' },
  { id: '193', en: 'Holidays -> Easter', id_lang: 'Liburan -> Paskah' },
  { id: '196', en: 'Holidays -> Fathers Day', id_lang: 'Liburan -> Hari Ayah' },
  { id: '192', en: 'Holidays -> Halloween', id_lang: 'Liburan -> Halloween' },
  { id: '208', en: 'Holidays -> Hanukkah', id_lang: 'Liburan -> Hanukkah' },
  { id: '206', en: 'Holidays -> Mardi Gras', id_lang: 'Liburan -> Mardi Gras' },
  { id: '195', en: 'Holidays -> Mothers Day', id_lang: 'Liburan -> Hari Ibu' },
  { id: '189', en: 'Holidays -> New Years', id_lang: 'Liburan -> Tahun Baru' },
  { id: '202', en: 'Holidays -> Other', id_lang: 'Liburan -> Lainnya' },
  { id: '205', en: 'Holidays -> Ramadan', id_lang: 'Liburan -> Ramadan' },
  { id: '191', en: 'Holidays -> Thanksgiving', id_lang: 'Liburan -> Thanksgiving' },
  { id: '194', en: 'Holidays -> Valentines Day', id_lang: 'Liburan -> Hari Valentine' },
  { id: '210', en: 'IT & C -> Artificial Intelligence', id_lang: 'TI & K -> Kecerdasan Buatan' },
  { id: '110', en: 'IT & C -> Connectivity', id_lang: 'TI & K -> Konektivitas' },
  { id: '113', en: 'IT & C -> Equipment', id_lang: 'TI & K -> Peralatan' },
  { id: '111', en: 'IT & C -> Internet', id_lang: 'TI & K -> Internet' },
  { id: '109', en: 'IT & C -> Networking', id_lang: 'TI & K -> Jaringan' },
  { id: '212', en: 'Illustrations & Clipart -> AI generated', id_lang: 'Ilustrasi & Clipart -> Buatan AI' },
  { id: '166', en: 'Illustrations & Clipart -> 3D & Computer generated', id_lang: 'Ilustrasi & Clipart -> 3D & Buatan Komputer' },
  { id: '167', en: 'Illustrations & Clipart -> Hand drawn & Artistic', id_lang: 'Ilustrasi & Clipart -> Gambar Tangan & Artistik' },
  { id: '163', en: 'Illustrations & Clipart -> Illustrations', id_lang: 'Ilustrasi & Clipart -> Ilustrasi' },
  { id: '186', en: 'Illustrations & Clipart -> Vector', id_lang: 'Ilustrasi & Clipart -> Vektor' },
  { id: '101', en: 'Industries -> Agriculture', id_lang: 'Industri -> Pertanian' },
  { id: '89', en: 'Industries -> Architecture', id_lang: 'Industri -> Arsitektur' },
  { id: '87', en: 'Industries -> Banking', id_lang: 'Industri -> Perbankan' },
  { id: '93', en: 'Industries -> Cargo & Shipping', id_lang: 'Industri -> Kargo & Pengiriman' },
  { id: '94', en: 'Industries -> Communications', id_lang: 'Industri -> Komunikasi' },
  { id: '91', en: 'Industries -> Computers', id_lang: 'Industri -> Komputer' },
  { id: '90', en: 'Industries -> Construction', id_lang: 'Industri -> Konstruksi' },
  { id: '150', en: 'Industries -> Education', id_lang: 'Industri -> Pendidikan' },
  { id: '136', en: 'Industries -> Entertainment', id_lang: 'Industri -> Hiburan' },
  { id: '99', en: 'Industries -> Environment', id_lang: 'Industri -> Lingkungan' },
  { id: '127', en: 'Industries -> Food & Beverages', id_lang: 'Industri -> Makanan & Minuman' },
  { id: '92', en: 'Industries -> Healthcare & Medical', id_lang: 'Industri -> Kesehatan & Medis' },
  { id: '96', en: 'Industries -> Insurance', id_lang: 'Industri -> Asuransi' },
  { id: '95', en: 'Industries -> Legal', id_lang: 'Industri -> Hukum' },
  { id: '100', en: 'Industries -> Manufacturing', id_lang: 'Industri -> Manufaktur' },
  { id: '102', en: 'Industries -> Military', id_lang: 'Industri -> Militer' },
  { id: '161', en: 'Industries -> Oil and gas', id_lang: 'Industri -> Minyak dan Gas' },
  { id: '97', en: 'Industries -> Power and energy', id_lang: 'Industri -> Tenaga dan Energi' },
  { id: '157', en: 'Industries -> Sports', id_lang: 'Industri -> Olahraga' },
  { id: '98', en: 'Industries -> Transportation', id_lang: 'Industri -> Transportasi' },
  { id: '88', en: 'Industries -> Travel', id_lang: 'Industri -> Wisata' },
  { id: '22', en: 'Nature -> Clouds and skies', id_lang: 'Alam -> Awan dan Langit' },
  { id: '17', en: 'Nature -> Deserts', id_lang: 'Alam -> Gurun' },
  { id: '14', en: 'Nature -> Details', id_lang: 'Alam -> Detail' },
  { id: '27', en: 'Nature -> Fields & Meadows', id_lang: 'Alam -> Ladang & Padang Rumput' },
  { id: '25', en: 'Nature -> Flowers & Gardens', id_lang: 'Alam -> Bunga & Taman' },
  { id: '28', en: 'Nature -> Food ingredients', id_lang: 'Alam -> Bahan Makanan' },
  { id: '18', en: 'Nature -> Forests', id_lang: 'Alam -> Hutan' },
  { id: '137', en: 'Nature -> Fruits & Vegetables', id_lang: 'Alam -> Buah & Sayuran' },
  { id: '11', en: 'Nature -> Generic vegetation', id_lang: 'Alam -> Vegetasi Umum' },
  { id: '143', en: 'Nature -> Geologic and mineral', id_lang: 'Alam -> Geologi dan Mineral' },
  { id: '16', en: 'Nature -> Lakes and rivers', id_lang: 'Alam -> Danau dan Sungai' },
  { id: '146', en: 'Nature -> Landscapes', id_lang: 'Alam -> Lanskap' },
  { id: '15', en: 'Nature -> Mountains', id_lang: 'Alam -> Pegunungan' },
  { id: '12', en: 'Nature -> Plants and trees', id_lang: 'Alam -> Tanaman dan Pohon' },
  { id: '19', en: 'Nature -> Sea & Ocean', id_lang: 'Alam -> Laut & Samudra' },
  { id: '26', en: 'Nature -> Seasons specific', id_lang: 'Alam -> Musim Tertentu' },
  { id: '23', en: 'Nature -> Sunsets & Sunrises', id_lang: 'Alam -> Matahari Terbenam & Terbit' },
  { id: '20', en: 'Nature -> Tropical', id_lang: 'Alam -> Tropis' },
  { id: '171', en: 'Nature -> Water', id_lang: 'Alam -> Air' },
  { id: '24', en: 'Nature -> Waterfalls', id_lang: 'Alam -> Air Terjun' },
  { id: '142', en: 'Objects -> Clothing & Accessories', id_lang: 'Objek -> Pakaian & Aksesori' },
  { id: '147', en: 'Objects -> Electronics', id_lang: 'Objek -> Elektronik' },
  { id: '138', en: 'Objects -> Home related', id_lang: 'Objek -> Terkait Rumah' },
  { id: '135', en: 'Objects -> Isolated', id_lang: 'Objek -> Terisolasi' },
  { id: '151', en: 'Objects -> Music and sound', id_lang: 'Objek -> Musik dan Suara' },
  { id: '145', en: 'Objects -> Other', id_lang: 'Objek -> Lainnya' },
  { id: '152', en: 'Objects -> Retro', id_lang: 'Objek -> Retro' },
  { id: '156', en: 'Objects -> Sports', id_lang: 'Objek -> Olahraga' },
  { id: '144', en: 'Objects -> Still life', id_lang: 'Objek -> Benda Mati' },
  { id: '140', en: 'Objects -> Tools', id_lang: 'Objek -> Perkakas' },
  { id: '134', en: 'Objects -> Toys', id_lang: 'Objek -> Mainan' },
  { id: '123', en: 'People -> Active', id_lang: 'Orang -> Aktif' },
  { id: '139', en: 'People -> Body parts', id_lang: 'Orang -> Bagian Tubuh' },
  { id: '119', en: 'People -> Children', id_lang: 'Orang -> Anak-anak' },
  { id: '175', en: 'People -> Cosmetic & Makeup', id_lang: 'Orang -> Kosmetik & Makeup' },
  { id: '115', en: 'People -> Couples', id_lang: 'Orang -> Pasangan' },
  { id: '122', en: 'People -> Diversity', id_lang: 'Orang -> Keberagaman' },
  { id: '159', en: 'People -> Expressions', id_lang: 'Orang -> Ekspresi' },
  { id: '118', en: 'People -> Families', id_lang: 'Orang -> Keluarga' },
  { id: '117', en: 'People -> Men', id_lang: 'Orang -> Pria' },
  { id: '173', en: 'People -> Nudes', id_lang: 'Orang -> Telanjang' },
  { id: '162', en: 'People -> Portraits', id_lang: 'Orang -> Potret' },
  { id: '121', en: 'People -> Seniors', id_lang: 'Orang -> Lansia' },
  { id: '120', en: 'People -> Teens', id_lang: 'Orang -> Remaja' },
  { id: '116', en: 'People -> Women', id_lang: 'Orang -> Wanita' },
  { id: '160', en: 'People -> Workers', id_lang: 'Orang -> Pekerja' },
  { id: '105', en: 'Technology -> Computers', id_lang: 'Teknologi -> Komputer' },
  { id: '106', en: 'Technology -> Connections', id_lang: 'Teknologi -> Koneksi' },
  { id: '129', en: 'Technology -> Electronics', id_lang: 'Teknologi -> Elektronik' },
  { id: '148', en: 'Technology -> Other', id_lang: 'Teknologi -> Lainnya' },
  { id: '107', en: 'Technology -> Retro', id_lang: 'Teknologi -> Retro' },
  { id: '209', en: 'Technology -> Science', id_lang: 'Teknologi -> Sains' },
  { id: '104', en: 'Technology -> Telecommunications', id_lang: 'Teknologi -> Telekomunikasi' },
  { id: '56', en: 'Travel -> Africa', id_lang: 'Wisata -> Afrika' },
  { id: '58', en: 'Travel -> America', id_lang: 'Wisata -> Amerika' },
  { id: '176', en: 'Travel -> Antarctica', id_lang: 'Wisata -> Antartika' },
  { id: '65', en: 'Travel -> Arts & Architecture', id_lang: 'Wisata -> Seni & Arsitektur' },
  { id: '57', en: 'Travel -> Asia', id_lang: 'Wisata -> Asia' },
  { id: '60', en: 'Travel -> Australasian', id_lang: 'Wisata -> Australasia' },
  { id: '62', en: 'Travel -> Cruise', id_lang: 'Wisata -> Pelayaran' },
  { id: '63', en: 'Travel -> Cuisine', id_lang: 'Wisata -> Kuliner' },
  { id: '67', en: 'Travel -> Currencies', id_lang: 'Wisata -> Mata Uang' },
  { id: '61', en: 'Travel -> Destination scenics', id_lang: 'Wisata -> Pemandangan Destinasi' },
  { id: '59', en: 'Travel -> Europe', id_lang: 'Wisata -> Eropa' },
  { id: '68', en: 'Travel -> Flags', id_lang: 'Wisata -> Bendera' },
  { id: '64', en: 'Travel -> Resorts', id_lang: 'Wisata -> Resor' },
  { id: '66', en: 'Travel -> Tropical', id_lang: 'Wisata -> Tropis' },
  { id: '201', en: 'Web Design Graphics -> Banners', id_lang: 'Grafis Desain Web -> Spanduk' },
  { id: '200', en: 'Web Design Graphics -> Buttons', id_lang: 'Grafis Desain Web -> Tombol' },
  { id: '199', en: 'Web Design Graphics -> Web Backgrounds & Textures', id_lang: 'Grafis Desain Web -> Latar Belakang & Tekstur Web' },
  { id: '198', en: 'Web Design Graphics -> Web Icons', id_lang: 'Grafis Desain Web -> Ikon Web' }
];

// LACI KATEGORI DITAMBAHKAN "categoryDream"
export const INITIAL_METADATA: FileMetadata = {
  en: { title: '', keywords: '' },
  ind: { title: '', keywords: '' },
  category: '',
  categoryShutter: '', 
  categoryDream: '', // <--- Ini laci baru untuk nyimpan 3 ID Dreamstime (misal: "112,145,105")
};

// MODEL LISTS (Hanya yang didukung internal Gemini Canvas)
export const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Fast & Accurate)' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Deep Reasoning)' },
];

export const GROQ_MODELS = [
  { value: 'moonshotai/kimi-k2-instruct-0905', label: 'Kimi K2 0905 (Idea & Prompt)' },
  { value: 'qwen/qwen3-32b', label: 'Qwen3-32B (Idea & Prompt)' },
  { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B 16E (Metadata)' },
];

// TEMPLATE PROMPT (Wajib untuk Halaman Generate Prompt)
export const DEFAULT_PROMPT_TEMPLATE = `
You are an expert stock contributor assistant. Your task is to generate metadata in TWO LANGUAGES (English and Indonesian).

STRICT RULES FOR TITLE/DESCRIPTION:
1. **Format:** [Subject] + [Action/Context] + [Environment/Style].
2. **Buyer Focused:** Describe exactly what is seen. No emotions, no opinions.
3. **Forbidden:** Do NOT use brand names, public figures, or tech specs (4K, HD).

STRICT RULES FOR KEYWORDS:
1. **Hierarchy:** The first 10 keywords MUST be the most relevant.
2. **Content:** Specific visual elements, themes, and style.

IMPORTANT:
- Generate "en" (English) version first.
- Generate "ind" (Indonesian) version which is a professional translation.

JSON OUTPUT FORMAT ONLY:
{
  "en": {
    "title": "String",
    "keywords": "String (comma separated)"
  },
  "ind": {
    "title": "String",
    "keywords": "String (comma separated)"
  },
  "category": "String"
}
`;

// === APP CODE CONTEXT FOR AI ASSISTANT ===
export const APP_CODE_CONTEXT = `
CONTEXT FOR AI ASSISTANT:
You are the assistant for the "IsaProject" application.

HOW THE APP WORKS:
1. **Engine:** Ditenagai oleh Google Gemini Canvas (Akses Internal).
2. **Mode Kerja:** - Idea Mode 1 (AI Concept) & Mode 2 (Local Database).
   - Prompt Engineering (AI Instruction Builder).
   - Metadata Extraction (Visual Analysis for Stocks).
3. **Privacy:** Semua data diproses secara lokal di browser pengguna.
`;
