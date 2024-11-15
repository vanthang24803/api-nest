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
