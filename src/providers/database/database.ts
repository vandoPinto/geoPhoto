import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class DatabaseProvider {
  currentDb: SQLiteObject = null;
  constructor(private sqlite: SQLite) { }

  /*Inicia a criação do banco de dados no dispositivo */
  async getDB() {
    return this.sqlite.create({
      name: 'coordenadas.db',
      location: 'default'
    }).then(db => this.currentDb = db);
  }

  /*Criação da tabela e inserção dos itens default, caso a tabela esteja vazia. */
  public createDatabase() {
    this.getDB().then(() => {
      this.createTables()
        .then(() => this.insertDefaultItems())
    })
      .catch(e => console.log(e));
  }

  /*Criação da tabela */
  private createTables() {
    return this.currentDb.sqlBatch([
      ['CREATE TABLE IF NOT EXISTS coordenadas (id integer primary key AUTOINCREMENT NOT NULL, longitude TEXT, latitude TEXT, hora TEXT, imagem TEXT)']
    ])
      .then(() => console.log('tabelas criadas'))
      .catch(e => console.error('Erro ao criar as tabelas', e))
  }

  /*inserindo itens default, caso a tabela esteja vazia. */
  private insertDefaultItems() {
    this.currentDb.executeSql('select COUNT(id) as qtd from coordenadas', [])
      .then((data: any) => {
        if (data.rows.item(0).qtd == 0) {
          this.insertDataBase({ lat: '-15.000', long: '-47.0000', hora: '12:00', imagem: '123' })
            .then(() => console.log('Dados default incluídos com sucesso!'))
            .catch(e => console.error('Erro ao incluir os dados default', e));
        }
      })
      .catch(e => console.error('Erro ao consultar a qtd de coordenadas', e));
  }

  /*Inserir no banco as informações do usuário */
  public insertDataBase(parametros) {
    const { lat, long, hora, imagem } = parametros;
    return this.currentDb.sqlBatch([
      ['insert into coordenadas (longitude,latitude,hora,imagem) values (?,?,?,?)', [lat, long, hora, imagem]],
    ])
      .then(() => console.log('Dados default incluídos com sucesso!'))
      .catch(e => console.error('Erro ao incluir os dados default', e));
  }
}