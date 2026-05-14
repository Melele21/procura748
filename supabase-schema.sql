-- ============================================================
-- 748 Development — Sistema de Procura
-- Supabase SQL Schema
-- Ejecutar en: supabase.com → SQL Editor → New query
-- ============================================================

-- ── EXTENSION ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── COUNTERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  value INTEGER DEFAULT 0
);

INSERT INTO counters (name, value) VALUES
  ('PO', 0), ('RFQ', 0), ('CMP', 0), ('DEL', 0), ('GR', 0), ('PAY', 0)
ON CONFLICT (name) DO NOTHING;

-- Función atómica para incrementar contador y retornar el nuevo valor
CREATE OR REPLACE FUNCTION increment_counter(counter_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_val INTEGER;
BEGIN
  UPDATE counters SET value = value + 1 WHERE name = counter_name
  RETURNING value INTO new_val;
  RETURN new_val;
END;
$$ LANGUAGE plpgsql;

-- ── SUPPLIERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  rating NUMERIC DEFAULT 4.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cargar los 27 proveedores reales de 748 Development
INSERT INTO suppliers (code, name, contact_name, email, phone, category, rating) VALUES
  ('S001','White Cap','Daniel Regalado','Daniel.Regalado@whitecap.com','786-914-0066','Encofrado y Formaleta',4.0),
  ('S002','United Rental','Ike Washington','iwashingto@ur.com','786-860-7568','Equipos',4.0),
  ('S003','Herc Rental','Luis Jeannot','luis.jeannot@hercrentals.com','786-570-9147','Equipos',4.0),
  ('S004','Sunbelt','John Davis','','305-796-3469','Equipos',4.0),
  ('S005','Mighty Trucking','','','786-251-0032','Transporte',4.0),
  ('S006','PMS CMU Install','Luis Sevilla','lsevilla311@gmail.com','305-725-4280','Obras Civiles',4.0),
  ('S007','Cemex','Valentina Gonzalez','valentina.gonzalezv@cemex.com','832-472-2704','Materiales',4.5),
  ('S008','Polimix','Alberto Santana','alberto@polimix.us','786-458-7893','Concreto',4.5),
  ('S009','Hilti','Richard Toquice','','954-350-2065','Equipos',4.5),
  ('S010','Stucco and Painting Solution','Edgar Villanueva','','786-251-2422','Pintura',4.0),
  ('S011','Potros Trucking','Jose Lopez','','786-412-0296','Transporte',4.0),
  ('S012','Alsina Forms','Marcos Mirabal','marcos.mirabal@alsina.com','305-924-4710','Encofrado y Formaleta',4.5),
  ('S013','City Electric Supply','Lazaro','','786-969-5315','Electrico',4.0),
  ('S014','Kavana Tile Bath Kitchen','Orlando Rodriguez','orodriguez@kavanafloorandbath.com','786-281-2760','Pisos y Revestimientos',4.0),
  ('S015','Lobo Services LLC','Carlos Lobo','LoboServicesLLC@outlook.com','786-468-1259','Paisajismo',4.0),
  ('S016','Floor and Decor','Scarlet Garcia','Scarlet.GarciaUlerio@flooranddecor.com','786-858-2331','Pisos y Revestimientos',4.5),
  ('S017','Brospro','Leonel Mejia','brosprobuild@hotmail.com','305-491-2638','Acabados',4.0),
  ('S018','The Home Depot','Daniel Carniglia','MANUEL_D_CARNIGLIA@homedepot.com','786-886-7819','Materiales',4.5),
  ('S019','George Crane','','','305-513-0188','Equipos',4.0),
  ('S020','Nu-Vue','Enzo Murias','enzo.nuvue@gmail.com','754-465-1549','Acero Estructural',4.0),
  ('S021','ESP Windows','Danny','','786-344-4342','Vidrio y Aluminios',4.0),
  ('S022','V&V Windows','Jorge','','786-760-0914','Vidrio y Aluminios',4.0),
  ('S023','Nachon Cabilla','Jose Sixto','sixtonachon@gmail.com','786-280-5855','Acero Estructural',4.0),
  ('S024','USA High Security Corp','','','305-733-0792','Seguridad Electronica',4.0),
  ('S025','G Proulx Building Products','Ryan H','ryanh@gpbpllc.com','954-922-1429','Acero Estructural',4.0),
  ('S026','KJ Materials LLC','Victor Herrera','sales7401@kjmaterials.net','305-522-8943','Drywall Tabiqueria',4.0),
  ('S027','Medley Steel and Supply','Julio Jimenez','jjimenez@medleysteel.com','305-525-2919','Acero Estructural',4.0)
ON CONFLICT (code) DO NOTHING;

-- ── PROJECTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  budget NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Activo',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO projects (code, name, budget, status) VALUES
  ('LP-2026-A','Residencial Las Palmas - Torre A',250000,'Activo'),
  ('OR-2026-2','Centro Comercial Orion - Fase 2',180000,'Activo'),
  ('BM-2026-1','Edificio Corporativo Bello Monte',320000,'Activo'),
  ('ER-2026-V','Urbanizacion El Rosal - Vialidad',95000,'Activo')
ON CONFLICT (code) DO NOTHING;

-- ── COST CODES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cost_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  full_label TEXT NOT NULL
);

INSERT INTO cost_codes (code, description, full_label) VALUES
  ('01 45 00','Quality Control','01 45 00 — Quality Control'),
  ('01 54 00','Construction Aids','01 54 00 — Construction Aids'),
  ('01 74 00','Cleaning and Waste Management','01 74 00 — Cleaning and Waste Management'),
  ('01 76 00','Protecting Installed Construction','01 76 00 — Protecting Installed Construction'),
  ('02 40 00','Demolition and Structure Moving','02 40 00 — Demolition and Structure Moving'),
  ('03 00 00','Concrete','03 00 00 — Concrete'),
  ('03 30 00','Cast-in-Place Concrete','03 30 00 — Cast-in-Place Concrete'),
  ('03 37 00','Specialty Placed Concrete','03 37 00 — Specialty Placed Concrete'),
  ('04 00 00','Masonry','04 00 00 — Masonry'),
  ('05 00 00','Metals','05 00 00 — Metals'),
  ('05 12 00','Structural Steel Framing','05 12 00 — Structural Steel Framing'),
  ('05 40 00','Cold-Formed Metal Framing','05 40 00 — Cold-Formed Metal Framing'),
  ('06 00 00','Wood Plastics and Composites','06 00 00 — Wood, Plastics, and Composites'),
  ('06 40 00','Architectural Woodwork','06 40 00 — Architectural Woodwork'),
  ('06 46 00','Wood Trim','06 46 00 — Wood Trim'),
  ('07 00 00','Thermal and Moisture Protection','07 00 00 — Thermal and Moisture Protection'),
  ('08 00 00','Openings','08 00 00 — Openings'),
  ('08 10 00','Doors and Frames','08 10 00 — Doors and Frames'),
  ('08 13 00','Metal Doors','08 13 00 — Metal Doors'),
  ('08 55 00','Pressure-Resistant Windows','08 55 00 — Pressure-Resistant Windows'),
  ('08 55 01','Windows Handling','08 55 01 — Windows Handling'),
  ('08 83 00','Mirrors','08 83 00 — Mirrors'),
  ('09 00 00','Finishes','09 00 00 — Finishes'),
  ('09 20 00','Plaster and Gypsum Board','09 20 00 — Plaster and Gypsum Board'),
  ('09 21 00','Plaster and Gypsum Board Assemblies','09 21 00 — Plaster and Gypsum Board Assemblies'),
  ('09 22 00','Supports for Plaster and Gypsum Board','09 22 00 — Supports for Plaster and Gypsum Board'),
  ('09 23 00','Gypsum Plastering','09 23 00 — Gypsum Plastering'),
  ('09 60 00','Flooring','09 60 00 — Flooring'),
  ('10 28 00','Toilet Bath and Laundry Accessories','10 28 00 — Toilet, Bath, and Laundry Accessories'),
  ('10 55 00','Postal Specialties','10 55 00 — Postal Specialties'),
  ('11 30 00','Residential Equipment','11 30 00 — Residential Equipment'),
  ('12 36 00','Countertops','12 36 00 — Countertops'),
  ('21 13 00','Fire-Suppression Sprinkler Systems','21 13 00 — Fire-Suppression Sprinkler Systems'),
  ('22 10 00','Plumbing Piping','22 10 00 — Plumbing Piping'),
  ('23 00 00','HVAC','23 00 00 — HVAC'),
  ('26 00 00','Electrical','26 00 00 — Electrical'),
  ('28 23 00','Video Management System','28 23 00 — Video Management System'),
  ('31 00 00','Earthwork','31 00 00 — Earthwork'),
  ('31 22 00','Grading','31 22 00 — Grading'),
  ('31 23 00','Excavation and Fill','31 23 00 — Excavation and Fill'),
  ('31 31 00','Soil Treatment','31 31 00 — Soil Treatment'),
  ('31 68 00','Foundation Anchors','31 68 00 — Foundation Anchors'),
  ('31 70 00','Tunneling and Mining','31 70 00 — Tunneling and Mining'),
  ('31 71 00','Tunnel Excavation','31 71 00 — Tunnel Excavation'),
  ('31 72 00','Tunnel Support Systems','31 72 00 — Tunnel Support Systems'),
  ('31 74 00','Tunnel Construction','31 74 00 — Tunnel Construction'),
  ('31 75 00','Shaft Construction','31 75 00 — Shaft Construction'),
  ('31 77 00','Submersible Tube Tunnels','31 77 00 — Submersible Tube Tunnels'),
  ('33 00 00','Utilities','33 00 00 — Utilities'),
  ('33 10 00','Water Utilities','33 10 00 — Water Utilities'),
  ('33 40 00','Stormwater Utilities','33 40 00 — Stormwater Utilities'),
  ('33 80 00','Communications Utilities','33 80 00 — Communications Utilities'),
  ('34 00 00','Transportation','34 00 00 — Transportation')
ON CONFLICT (code) DO NOTHING;

-- ── REQUISITIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requisitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  req_type TEXT NOT NULL CHECK (req_type IN ('field','estimation')),
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  required_date DATE NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgente','normal','planificado')),
  stage TEXT DEFAULT 'REQ' CHECK (stage IN ('REQ','RFQ','CMP','PO','DEL','RCV','PAY')),
  project_id UUID REFERENCES projects(id),
  project_code TEXT,
  cost_code TEXT,
  cost_center TEXT,
  site TEXT,
  field_requested_by TEXT,
  field_supervisor TEXT,
  estimated_budget NUMERIC,
  estimated_qty NUMERIC,
  justification TEXT,
  suggested_supplier TEXT,
  target_date DATE,
  history JSONB DEFAULT '[]',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RFQs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_number TEXT UNIQUE NOT NULL,
  po_id UUID REFERENCES requisitions(id),
  po_number TEXT,
  description TEXT,
  quantity NUMERIC,
  unit TEXT,
  due_date DATE,
  notes TEXT,
  supplier_ids JSONB DEFAULT '[]',
  responses JSONB DEFAULT '[]',
  status TEXT DEFAULT 'enviada' CHECK (status IN ('enviada','con_respuestas','cerrada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── COMPARISONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cmp_number TEXT UNIQUE NOT NULL,
  rfq_id UUID REFERENCES rfqs(id),
  po_id UUID REFERENCES requisitions(id),
  po_number TEXT,
  scored JSONB DEFAULT '[]',
  winner_id TEXT,
  winner_name TEXT,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente','aprobado')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ORDERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  po_id UUID REFERENCES requisitions(id),
  cmp_id UUID REFERENCES comparisons(id),
  supplier_id TEXT,
  supplier_name TEXT,
  description TEXT,
  quantity NUMERIC,
  unit TEXT,
  unit_price NUMERIC,
  total_amount NUMERIC,
  delivery_address TEXT,
  payment_terms TEXT,
  contact_name TEXT,
  contact_email TEXT,
  delivery_days INTEGER,
  notes TEXT,
  approval_status TEXT DEFAULT 'pendiente' CHECK (approval_status IN ('pendiente','aprobado','rechazado')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  sent_to_supplier BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── DELIVERIES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  del_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  po_number TEXT,
  supplier_id TEXT,
  supplier_name TEXT,
  expected_date DATE,
  logistics_type TEXT DEFAULT 'entrega' CHECK (logistics_type IN ('entrega','recogida')),
  tracking_number TEXT,
  status TEXT DEFAULT 'en_camino' CHECK (status IN ('en_camino','parcial','completado','retrasado')),
  notes TEXT,
  partials JSONB DEFAULT '[]',
  events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── RECEIPTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gr_number TEXT UNIQUE NOT NULL,
  delivery_id UUID REFERENCES deliveries(id),
  order_id UUID REFERENCES orders(id),
  po_number TEXT,
  supplier_id TEXT,
  supplier_name TEXT,
  checklist JSONB DEFAULT '{}',
  result TEXT DEFAULT 'conforme' CHECK (result IN ('conforme','no_conforme')),
  received_by TEXT,
  received_qty NUMERIC,
  observations TEXT,
  discrepancies JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pay_number TEXT UNIQUE NOT NULL,
  gr_id UUID REFERENCES receipts(id),
  order_id UUID REFERENCES orders(id),
  po_number TEXT,
  supplier_id TEXT,
  supplier_name TEXT,
  invoice_number TEXT,
  invoice_amount NUMERIC,
  invoice_date DATE,
  due_date DATE,
  payment_method TEXT,
  notes_for_ap TEXT,
  match_result BOOLEAN DEFAULT false,
  match_details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'listo' CHECK (status IN ('listo','pagado')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY (básico — todos los usuarios autenticados) ──
ALTER TABLE requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

-- Políticas: acceso total para usuarios autenticados
DO $$ BEGIN
  FOR t IN SELECT unnest(ARRAY['requisitions','rfqs','comparisons','orders','deliveries','receipts','payments','suppliers','projects','cost_codes','counters']) LOOP
    EXECUTE format('CREATE POLICY "auth_all" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Acceso anónimo de solo lectura para suppliers, projects, cost_codes
CREATE POLICY "anon_read_suppliers" ON suppliers FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_projects" ON projects FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_cost_codes" ON cost_codes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_counters" ON counters FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_req" ON requisitions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_rfq" ON rfqs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_cmp" ON comparisons FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_ord" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_del" ON deliveries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_rcv" ON receipts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_pay" ON payments FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- FIN DEL SCHEMA
-- ============================================================
SELECT 'Schema de 748 Development Procura creado exitosamente' as resultado;
