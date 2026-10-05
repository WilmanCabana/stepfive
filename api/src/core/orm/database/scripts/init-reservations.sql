CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS "Reservations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "spaceId" UUID NOT NULL REFERENCES "SpaceRecreationals"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "startAt" TIMESTAMPTZ NOT NULL,
  "endAt" TIMESTAMPTZ NOT NULL,
  "totalPrice" NUMERIC(12, 2) NOT NULL,
  -- New reservations are paid manually; pending_payment remains valid for legacy rows.
  "status" TEXT NOT NULL DEFAULT 'paid'
    CHECK ("status" IN ('pending_payment', 'paid', 'cancelled', 'completed')),
  "paymentMethod" TEXT NOT NULL DEFAULT 'pse' CHECK ("paymentMethod" = 'pse'),
  "paymentReference" TEXT NULL,
  "notes" TEXT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdBy" TEXT NOT NULL DEFAULT 'System',
  "updatedAt" TIMESTAMPTZ NULL,
  "updatedBy" TEXT NULL,
  "deletedAt" TIMESTAMPTZ NULL,
  "deletedBy" TEXT NULL,
  CHECK ("endAt" > "startAt")
);

ALTER TABLE "Reservations" ALTER COLUMN "status" SET DEFAULT 'paid';

CREATE INDEX IF NOT EXISTS "idx_reservations_user_start" ON "Reservations" ("userId", "startAt");
CREATE INDEX IF NOT EXISTS "idx_reservations_space_start" ON "Reservations" ("spaceId", "startAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservations_no_overlapping_active_slots'
  ) THEN
    ALTER TABLE "Reservations"
      ADD CONSTRAINT "reservations_no_overlapping_active_slots"
      EXCLUDE USING gist (
        "spaceId" WITH =,
        tstzrange("startAt", "endAt", '[)') WITH &&
      ) WHERE ("status" IN ('pending_payment', 'paid'));
  END IF;
END $$;

INSERT INTO "Permissions" ("id", "name", "alias", "description", "type") VALUES
('b8c721d1-9284-4e2e-9a3a-920000000001', 'ReadReservations', 'Leer Reservas', 'Consultar reservas propias y de espacios autorizados.', 'Read'),
('b8c721d1-9284-4e2e-9a3a-920000000002', 'CreateReservations', 'Crear Reservas', 'Crear reservas de espacios recreativos.', 'Create'),
('b8c721d1-9284-4e2e-9a3a-920000000003', 'CancelReservations', 'Cancelar Reservas', 'Cancelar reservas propias.', 'Update'),
('b8c721d1-9284-4e2e-9a3a-920000000004', 'ReadOwnSpaceReservations', 'Leer Reservas de Espacios Propios', 'Consultar reservas de espacios propios.', 'Read'),
('b8c721d1-9284-4e2e-9a3a-920000000005', 'AccessReservations', 'Acceso a Reservas', 'Acceder al módulo de reservas.', 'Access')
ON CONFLICT DO NOTHING;

INSERT INTO "RolesPermissions" ("roleId", "permissionId") VALUES
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'b8c721d1-9284-4e2e-9a3a-920000000001'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'b8c721d1-9284-4e2e-9a3a-920000000002'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'b8c721d1-9284-4e2e-9a3a-920000000003'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'b8c721d1-9284-4e2e-9a3a-920000000004'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'b8c721d1-9284-4e2e-9a3a-920000000005'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'b8c721d1-9284-4e2e-9a3a-920000000001'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'b8c721d1-9284-4e2e-9a3a-920000000002'),
('f60fb7a5-673d-4f3e-af61-b800a79469a5', 'b8c721d1-9284-4e2e-9a3a-920000000003')
ON CONFLICT DO NOTHING;