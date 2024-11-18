INSERT INTO public.roles (id, role)
VALUES 
  (uuid_generate_v4(), 'Manager'),
  (uuid_generate_v4(), 'Customer'),
  (uuid_generate_v4(), 'Admin');


CREATE TABLE IF NOT EXISTS public.catalogs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

INSERT INTO catalogs (name)
VALUES
  ('Sách mới'),
  ('Tiểu thuyết'),
  ('Manga-Commic'),
  ('Light Novel'),
   ('Kỹ Năng'),
  ('Thiếu nhi');


INSERT INTO public.templates (type, template)
VALUES
  (0, 'Chào {USERNAME}, vui lòng xác thực tài khoản của bạn tại đây: {LINK}'),
  (1, 'Xin chào {USERNAME}, bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào liên kết này để tiếp tục: {LINK}'),
  (2, 'Chào {USERNAME}, đơn hàng của bạn đã được xác nhận. Chi tiết đơn hàng: {LINK}');
