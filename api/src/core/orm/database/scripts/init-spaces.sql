INSERT INTO "Permissions" ("id", "name", "alias", "description", "type") VALUES
('c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c01', 'ReadSpaces', 'Leer Espacios', 'Permite listar y consultar espacios recreativos.', 'Read'),
('c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c02', 'CreateSpaces', 'Crear Espacios', 'Permite registrar espacios recreativos.', 'Create'),
('c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c03', 'UpdateSpaces', 'Actualizar Espacios', 'Permite actualizar espacios recreativos.', 'Update'),
('c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c04', 'DeleteSpaces', 'Eliminar Espacios', 'Permite eliminar espacios recreativos.', 'Delete'),
('c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c05', 'VerifySpaces', 'Verificar Espacios', 'Permite aprobar o rechazar espacios recreativos.', 'Verify'),
('c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c06', 'AccessSpaces', 'Acceso a Espacios', 'Permite acceder al módulo de espacios recreativos.', 'Access')
ON CONFLICT DO NOTHING;

INSERT INTO "RolesPermissions" ("roleId", "permissionId")
VALUES
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c01'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c02'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c03'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c04'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c05'),
('5296f982-f8b4-4e9a-9ed9-89672f2c3700', 'c7a4c2dd-1a2f-4b29-8b11-9a4b9a8b7c06')
ON CONFLICT DO NOTHING;
