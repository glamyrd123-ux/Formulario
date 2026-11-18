# Security Specification — Solicitud de Diseño Web y Marca

## Data Invariants
1. Toda solicitud almacenada en `/solicitudes/{solicitudId}` debe respetar estrictamente las 22 columnas definidas en el esquema `SolicitudWeb`, más `estado` y `createdAt`.
2. Ningún documento puede incluir campos no declarados ("ghost fields") como `isAdmin`, `role`, `verified`, etc.
3. En la creación (`create`), `estado` debe ser estrictamente `'Nueva'` y `createdAt` debe coincidir con `request.time`.
4. La lectura (`get`, `list`), actualización (`update`) y eliminación (`delete`) de solicitudes contiene PII (`correo`, `telefono`, `direccion`), por lo que está estrictamente restringida a administradores verificados (`isAdmin()`).
5. La colección `/admins/{adminId}` no es modificable desde el cliente.

## Dirty Dozen Adversarial Payloads
1. Ghost field injection on create (`{ ..., isAdmin: true }`) -> PERMISSION_DENIED
2. Missing required field `nombreCompleto` on create -> PERMISSION_DENIED
3. Oversized string (> 3000 chars) in `productosServicios` -> PERMISSION_DENIED
4. Oversized document ID (> 128 chars or invalid chars) -> PERMISSION_DENIED
5. Spoofed `createdAt` timestamp on create -> PERMISSION_DENIED
6. Non-initial `estado: 'Completada'` on create -> PERMISSION_DENIED
7. Wrong field type (`telefono: 12345678` as number) -> PERMISSION_DENIED
8. Unauthenticated `list` on `/solicitudes` -> PERMISSION_DENIED
9. Non-admin signed-in user `get` on `/solicitudes/{id}` -> PERMISSION_DENIED
10. Unverified email (`email_verified: false`) matching admin email -> PERMISSION_DENIED
11. Non-admin `update` trying to mutate `estado` -> PERMISSION_DENIED
12. Admin `update` trying to mutate immutable `createdAt` -> PERMISSION_DENIED
