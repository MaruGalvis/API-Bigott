import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../app.module';
import { SalesTargetService } from '../sales-target/sales-target.service';

const MONTHS: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const DEFAULT_BASE_DIR =
  'C:\\Users\\marug\\OneDrive\\Escritorio\\Objetivos Anuales\\Objetivos Anuales';

async function bootstrap() {
  const baseDir = process.argv[2] ?? DEFAULT_BASE_DIR;

  if (!fs.existsSync(baseDir)) {
    console.error(`No existe la carpeta: ${baseDir}`);
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const salesTargetService = app.get(SalesTargetService);

  const yearFolders = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  let totalFiles = 0;
  let totalRowsImported = 0;
  const errors: string[] = [];

  for (const yearFolder of yearFolders) {
    const year = parseInt(yearFolder.name, 10);
    if (!Number.isInteger(year)) {
      console.warn(`Carpeta ignorada (no es un año válido): ${yearFolder.name}`);
      continue;
    }

    const yearPath = path.join(baseDir, yearFolder.name);
    const files = fs
      .readdirSync(yearPath)
      .filter((file) => file.toLowerCase().endsWith('.xlsx'));

    for (const file of files) {
      totalFiles++;
      const monthName = path.basename(file, path.extname(file)).trim().toLowerCase();
      const month = MONTHS[monthName];

      if (!month) {
        const message = `${yearFolder.name}/${file}: no se pudo identificar el mes por el nombre "${monthName}"`;
        errors.push(message);
        console.error(`SKIP  ${message}`);
        continue;
      }

      try {
        const buffer = fs.readFileSync(path.join(yearPath, file));
        const summary = await salesTargetService.importFromExcel(buffer, month, year);
        totalRowsImported += summary.rowsImported;
        console.log(
          `OK    ${yearFolder.name}/${file} -> ${summary.rowsImported} filas (mes ${month}, año ${year})`,
        );
        if (summary.skippedLabels.length > 0) {
          console.log(`      saltadas: ${summary.skippedLabels.join(', ')}`);
        }
      } catch (error: any) {
        const message = `${yearFolder.name}/${file}: ${error.message}`;
        errors.push(message);
        console.error(`ERROR ${message}`);
      }
    }
  }

  console.log('\n--- Resumen ---');
  console.log(`Archivos encontrados: ${totalFiles}`);
  console.log(`Filas importadas en total: ${totalRowsImported}`);
  console.log(`Errores: ${errors.length}`);
  errors.forEach((message) => console.log(' -', message));

  await app.close();
}

bootstrap();
