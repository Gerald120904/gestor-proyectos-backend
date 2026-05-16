ALTER TABLE clientes ADD INDEX idx_clientes_userId (userId);

ALTER TABLE proyectos ADD INDEX idx_proyectos_clienteId (clienteId);
ALTER TABLE proyectos ADD INDEX idx_proyectos_estado (estado);
ALTER TABLE proyectos ADD INDEX idx_proyectos_clienteId_estado (clienteId, estado);
ALTER TABLE proyectos ADD INDEX idx_proyectos_createdAt (createdAt);

ALTER TABLE pagos ADD INDEX idx_pagos_proyectoId (proyectoId);

ALTER TABLE isitas ADD INDEX idx_visitas_proyectoId (proyectoId);
ALTER TABLE isitas ADD INDEX idx_visitas_fecha_estado (echa, estado);

ALTER TABLE comentarios ADD INDEX idx_comentarios_proyectoId (proyectoId);

ALTER TABLE ecordatorios ADD INDEX idx_recordatorios_proyectoId (proyectoId);
ALTER TABLE ecordatorios ADD INDEX idx_recordatorios_completado (completado);
ALTER TABLE ecordatorios ADD INDEX idx_recordatorios_proyectoId_completado (proyectoId, completado);
ALTER TABLE ecordatorios ADD INDEX idx_recordatorios_fecha (echa);
