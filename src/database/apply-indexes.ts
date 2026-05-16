export async function applyIndexes(prisma: any) {
  const indexes = [
    'ALTER TABLE clientes ADD INDEX idx_clientes_userId (userId)',
    'ALTER TABLE proyectos ADD INDEX idx_proyectos_clienteId (clienteId)',
    'ALTER TABLE proyectos ADD INDEX idx_proyectos_estado (estado)',
    'ALTER TABLE proyectos ADD INDEX idx_proyectos_clienteId_estado (clienteId, estado)',
    'ALTER TABLE proyectos ADD INDEX idx_proyectos_createdAt (createdAt)',
    'ALTER TABLE pagos ADD INDEX idx_pagos_proyectoId (proyectoId)',
    'ALTER TABLE visitas ADD INDEX idx_visitas_proyectoId (proyectoId)',
    'ALTER TABLE visitas ADD INDEX idx_visitas_fecha_estado (fecha, estado)',
    'ALTER TABLE comentarios ADD INDEX idx_comentarios_proyectoId (proyectoId)',
    'ALTER TABLE recordatorios ADD INDEX idx_recordatorios_proyectoId (proyectoId)',
    'ALTER TABLE recordatorios ADD INDEX idx_recordatorios_completado (completado)',
    'ALTER TABLE recordatorios ADD INDEX idx_recordatorios_proyectoId_completado (proyectoId, completado)',
    'ALTER TABLE recordatorios ADD INDEX idx_recordatorios_fecha (fecha)',
  ];

  for (const sql of indexes) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✅ Índice aplicado`);
    } catch (e: any) {
      if (e.message?.includes('Duplicate key name')) {
        console.log(`⏭️ Índice ya existe, saltando`);
      } else {
        console.error(`❌ Error:`, e.message);
      }
    }
  }
}