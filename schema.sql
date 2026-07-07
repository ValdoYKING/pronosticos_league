-- ----------------------------
-- SCHEMA FOR QUINIELA APP
-- ----------------------------

-- 1. Create table for teams
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  flag TEXT NOT NULL,
  flag_url TEXT NOT NULL DEFAULT '',
  "group" TEXT NOT NULL DEFAULT 'A',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create table for matches
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  stage TEXT NOT NULL,
  team_a_id TEXT REFERENCES teams(id),
  team_b_id TEXT REFERENCES teams(id),
  winner_id TEXT REFERENCES teams(id),
  "date" TEXT NOT NULL,
  venue TEXT NOT NULL,
  next_match_id INTEGER REFERENCES matches(id),
  slot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create table for participants
-- This table will store user registrations identified by email.
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  team_ids TEXT[] NOT NULL DEFAULT '{}',      -- Array de IDs de equipos (multiselección)
  team_id TEXT REFERENCES teams(id),          -- Mantenido por compatibilidad (primer equipo)
  photo_type TEXT NOT NULL DEFAULT 'avatar',
  photo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'activo',      -- 'activo' | 'eliminado'
  draw_count INTEGER NOT NULL DEFAULT 1,
  ordenes_sorteo INTEGER[] DEFAULT '{}',
  orden_pronostico INTEGER,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create table for match results (persist winners/scores)
CREATE TABLE match_results (
  match_id INTEGER PRIMARY KEY REFERENCES matches(id),
  team_a_score INTEGER,
  team_b_score INTEGER,
  winner_id TEXT REFERENCES teams(id),
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_match_results_match_id ON match_results(match_id);


-- ----------------------------
-- INITIAL DATA INSERTS
-- ----------------------------

-- Insert all 48 teams (12 groups × 4 teams)
INSERT INTO teams (id, name, flag, flag_url, "group") VALUES
-- Grupo A
('MEX', 'México', '🇲🇽', 'https://flagcdn.com/w320/mx.png', 'A'),
('RSA', 'Sudáfrica', '🇿🇦', 'https://flagcdn.com/w320/za.png', 'A'),
('KOR', 'Corea del Sur', '🇰🇷', 'https://flagcdn.com/w320/kr.png', 'A'),
('CZE', 'Chequia', '🇨🇿', 'https://flagcdn.com/w320/cz.png', 'A'),
-- Grupo B
('CAN', 'Canadá', '🇨🇦', 'https://flagcdn.com/w320/ca.png', 'B'),
('BIH', 'Bosnia y Herzegovina', '🇧🇦', 'https://flagcdn.com/w320/ba.png', 'B'),
('QAT', 'Catar', '🇶🇦', 'https://flagcdn.com/w320/qa.png', 'B'),
('SUI', 'Suiza', '🇨🇭', 'https://flagcdn.com/w320/ch.png', 'B'),
-- Grupo C
('BRA', 'Brasil', '🇧🇷', 'https://flagcdn.com/w320/br.png', 'C'),
('MAR', 'Marruecos', '🇲🇦', 'https://flagcdn.com/w320/ma.png', 'C'),
('HAI', 'Haití', '🇭🇹', 'https://flagcdn.com/w320/ht.png', 'C'),
('SCO', 'Escocia', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'https://flagcdn.com/w320/gb-sct.png', 'C'),
-- Grupo D
('USA', 'EE. UU.', '🇺🇸', 'https://flagcdn.com/w320/us.png', 'D'),
('PAR', 'Paraguay', '🇵🇾', 'https://flagcdn.com/w320/py.png', 'D'),
('AUS', 'Australia', '🇦🇺', 'https://flagcdn.com/w320/au.png', 'D'),
('TUR', 'Turquía', '🇹🇷', 'https://flagcdn.com/w320/tr.png', 'D'),
-- Grupo E
('GER', 'Alemania', '🇩🇪', 'https://flagcdn.com/w320/de.png', 'E'),
('CUW', 'Curazao', '🇨🇼', 'https://flagcdn.com/w320/cw.png', 'E'),
('CIV', 'Costa de Marfil', '🇨🇮', 'https://flagcdn.com/w320/ci.png', 'E'),
('ECU', 'Ecuador', '🇪🇨', 'https://flagcdn.com/w320/ec.png', 'E'),
-- Grupo F
('NED', 'Países Bajos', '🇳🇱', 'https://flagcdn.com/w320/nl.png', 'F'),
('JPN', 'Japón', '🇯🇵', 'https://flagcdn.com/w320/jp.png', 'F'),
('SWE', 'Suecia', '🇸🇪', 'https://flagcdn.com/w320/se.png', 'F'),
('TUN', 'Túnez', '🇹🇳', 'https://flagcdn.com/w320/tn.png', 'F'),
-- Grupo G
('BEL', 'Bélgica', '🇧🇪', 'https://flagcdn.com/w320/be.png', 'G'),
('EGY', 'Egipto', '🇪🇬', 'https://flagcdn.com/w320/eg.png', 'G'),
('IRN', 'Irán', '🇮🇷', 'https://flagcdn.com/w320/ir.png', 'G'),
('NZL', 'Nueva Zelanda', '🇳🇿', 'https://flagcdn.com/w320/nz.png', 'G'),
-- Grupo H
('ESP', 'España', '🇪🇸', 'https://flagcdn.com/w320/es.png', 'H'),
('CPV', 'Islas de Cabo Verde', '🇨🇻', 'https://flagcdn.com/w320/cv.png', 'H'),
('KSA', 'Arabia Saudí', '🇸🇦', 'https://flagcdn.com/w320/sa.png', 'H'),
('URU', 'Uruguay', '🇺🇾', 'https://flagcdn.com/w320/uy.png', 'H'),
-- Grupo I
('FRA', 'Francia', '🇫🇷', 'https://flagcdn.com/w320/fr.png', 'I'),
('SEN', 'Senegal', '🇸🇳', 'https://flagcdn.com/w320/sn.png', 'I'),
('IRQ', 'Irak', '🇮🇶', 'https://flagcdn.com/w320/iq.png', 'I'),
('NOR', 'Noruega', '🇳🇴', 'https://flagcdn.com/w320/no.png', 'I'),
-- Grupo J
('ARG', 'Argentina', '🇦🇷', 'https://flagcdn.com/w320/ar.png', 'J'),
('ALG', 'Argelia', '🇩🇿', 'https://flagcdn.com/w320/dz.png', 'J'),
('AUT', 'Austria', '🇦🇹', 'https://flagcdn.com/w320/at.png', 'J'),
('JOR', 'Jordania', '🇯🇴', 'https://flagcdn.com/w320/jo.png', 'J'),
-- Grupo K
('POR', 'Portugal', '🇵🇹', 'https://flagcdn.com/w320/pt.png', 'K'),
('COD', 'RD Congo', '🇨🇩', 'https://flagcdn.com/w320/cd.png', 'K'),
('UZB', 'Uzbekistán', '🇺🇿', 'https://flagcdn.com/w320/uz.png', 'K'),
('COL', 'Colombia', '🇨🇴', 'https://flagcdn.com/w320/co.png', 'K'),
-- Grupo L
('ENG', 'Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'https://flagcdn.com/w320/gb-eng.png', 'L'),
('CRO', 'Croacia', '🇭🇷', 'https://flagcdn.com/w320/hr.png', 'L'),
('GHA', 'Ghana', '🇬🇭', 'https://flagcdn.com/w320/gh.png', 'L'),
('PAN', 'Panamá', '🇵🇦', 'https://flagcdn.com/w320/pa.png', 'L');

-- Insert matches structure (same as before, with empty teams)
INSERT INTO matches (id, stage, team_a_id, team_b_id, "date", venue, next_match_id, slot) VALUES
-- OCTAVOS
(1, 'Octavos', NULL, NULL, '11 de Jun • 19:00', 'Estadio Azteca, CDMX', 9, 'A'),
(2, 'Octavos', NULL, NULL, '12 de Jun • 20:00', 'MetLife Stadium, NY', 9, 'B'),
(3, 'Octavos', NULL, NULL, '13 de Jun • 18:00', 'BC Place, Vancouver', 10, 'A'),
(4, 'Octavos', NULL, NULL, '14 de Jun • 20:30', 'Estadio BBVA, MTY', 10, 'B'),
(5, 'Octavos', NULL, NULL, '15 de Jun • 17:00', 'SoFi Stadium, LA', 11, 'A'),
(6, 'Octavos', NULL, NULL, '16 de Jun • 21:00', 'Hard Rock, Miami', 11, 'B'),
(7, 'Octavos', NULL, NULL, '17 de Jun • 18:00', 'Mercedes-Benz, Atlanta', 12, 'A'),
(8, 'Octavos', NULL, NULL, '18 de Jun • 19:00', 'AT&T Stadium, Dallas', 12, 'B'),
-- CUARTOS
(9, 'Cuartos', NULL, NULL, '21 de Jun • 18:00', 'Gillette Stadium, Boston', 13, 'A'),
(10, 'Cuartos', NULL, NULL, '22 de Jun • 20:00', 'Arrowhead, KC', 13, 'B'),
(11, 'Cuartos', NULL, NULL, '23 de Jun • 19:00', 'NRG Stadium, Houston', 14, 'A'),
(12, 'Cuartos', NULL, NULL, '24 de Jun • 18:30', 'Levi''s Stadium, SF', 14, 'B'),
-- SEMIFINALES
(13, 'Semis', NULL, NULL, '26 de Jun • 20:00', 'MetLife Stadium, NY', 15, 'A'),
(14, 'Semis', NULL, NULL, '27 de Jun • 20:00', 'Estadio Azteca, CDMX', 15, 'B'),
-- FINAL
(15, 'Final', NULL, NULL, '05 de Jul • 16:00', 'MetLife Stadium, NY', NULL, NULL);

-- ----------------------------
-- ROW LEVEL SECURITY (RLS)
-- ----------------------------
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view participants
CREATE POLICY "Participants are viewable by everyone."
  ON participants FOR SELECT
  USING ( true );

-- Allow anyone to insert
CREATE POLICY "Anyone can insert a participant."
  ON participants FOR INSERT
  WITH CHECK ( true );

-- Allow anyone to update by email
CREATE POLICY "Anyone can update a participant by email."
  ON participants FOR UPDATE
  USING ( true );

-- Allow anyone to delete
CREATE POLICY "Anyone can delete a participant."
  ON participants FOR DELETE
  USING ( true );


-- ----------------------------
-- AUTOMATIC TIMESTAMPS
-- ----------------------------
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_matches_updated
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER on_participants_updated
  BEFORE UPDATE ON participants
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();


-- ----------------------------
-- STORAGE: Create bucket for photos
-- ----------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('participant-photos', 'participant-photos', true)
ON CONFLICT (id) DO NOTHING;


-- ----------------------------
-- 4. Create table for match results
-- ----------------------------
CREATE TABLE match_results (
  match_id INTEGER PRIMARY KEY,
  team_a_score INTEGER NOT NULL DEFAULT 0,
  team_b_score INTEGER NOT NULL DEFAULT 0,
  winner_id TEXT REFERENCES teams(id),
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups by winner
CREATE INDEX idx_match_results_winner_id ON match_results(winner_id);

ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Everyone can read match results
CREATE POLICY "Match results are viewable by everyone."
  ON match_results FOR SELECT
  USING ( true );

-- Anyone can insert match results
CREATE POLICY "Anyone can insert match results."
  ON match_results FOR INSERT
  WITH CHECK ( true );

-- Anyone can update match results
CREATE POLICY "Anyone can update match results."
  ON match_results FOR UPDATE
  USING ( true );

-- Anyone can delete match results
CREATE POLICY "Anyone can delete match results."
  ON match_results FOR DELETE
  USING ( true );

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER on_match_results_updated
  BEFORE UPDATE ON match_results
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();
