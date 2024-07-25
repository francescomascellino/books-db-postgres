import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Postuser } from '../postuser/entities/postuser.entity';
import { Postbook } from '../postbook/entities/postbook.entity';
import { PostuserPostbook } from '../postuser_postbook/entities/postuser_postbook.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'tinlayigpay82',
  database: 'library',
  entities: [Postuser, Postbook, PostuserPostbook],
  synchronize: false,
});

async function updatePasswords() {
  try {
    console.log(
      'Entità caricate:',
      AppDataSource.entityMetadatas.map((metadata) => metadata.name),
    );

    // Crea la connessione al database
    await AppDataSource.initialize();

    // Ottieni il repository per l'entità Postuser
    const postuserRepository = AppDataSource.getRepository(Postuser);

    // Trova tutti gli utenti nel database
    const users = await postuserRepository.find();

    // Hash delle password e aggiorna nel database
    for (const user of users) {
      if (!user.password.startsWith('$2y$')) {
        // Verifica se la password è già hashata
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        await postuserRepository.save(user);
      }
    }

    console.log('Tutte le password sono state aggiornate.');
  } catch (error) {
    console.error("Errore durante l'aggiornamento delle password:", error);
  } finally {
    await AppDataSource.destroy(); // Chiude la connessione al database
  }
}

updatePasswords();
