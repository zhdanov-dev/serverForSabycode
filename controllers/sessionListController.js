const {SessionList, connection, Session} = require('../models/models');
const fs = require('fs');
const path = require('path');

class sessionListController {

    /**
     * Удаление сессии из списка
     * @param {string} stat - Название файла
     * @param {string} user - User ID
     * Находим соединение и удаляем его
     * Если у сессии не осталось соединений то удаляем и саму сессию
     */

    async removeConnection(req, res) {
        try {
            const stat = req.body.stat;
            const user = req.user;
            const sessionList = await SessionList.findOne({where: {userId: user}});
            const session = await Session.findOne({where: {sessionStatic: stat}});
            const conn = await connection.findOne({where: {sessionListId: sessionList.id, sessionId: session.id}});
            if (conn) await conn.destroy();
            const fileName = await connection.findAll({where: {sessionId: session.id}});
            if (!fileName) {
                await session.destroy();
                fs.unlinkSync((path.resolve(__dirname, '..', 'sessions', `${stat}`)), () => {
                    console.log('Файл удален!');
                });
            }
            res.json("Соединение удалено!");
        } catch (error) {
            console.log(error);
            return res.status(500).json('Соединение не найдено!');
        }
    }

    /**
     * Получение всех сессий
     * @param {string} user - User ID
     * Находим все соединения, после все файлы и формируем массив названий файлов
     * Далее формируем массив объектов с названиями файлов, датами их создания и редактирования
     */

    async getConnections(req, res) {
        try {
            const user = req.user;
            const sList = await SessionList.findOne({where: {userId: user}});
            const allConnection = await connection.findAll({where: {sessionListId: sList.id}});
            let allFiles = [];
            for (let i = 0; i < allConnection.length; i++) {
                let oneFile = await Session.findOne({where: {id: allConnection[i].sessionId}});
                allFiles = [...allFiles, oneFile];
            }
            let fileName = [];
            let users = [];
            let language = [];
            allFiles.forEach(element => {
                fileName = [...fileName, element.sessionStatic];
                users = [...users, element.users];
                language = [...language, element.language];
            });
            const infoOfSession = [];
            for (let i = 0; i < fileName.length; i++) {
                const file = fs.statSync((path.resolve(__dirname, '..' ,'sessions', fileName[i])));
                infoOfSession[i] = {
                    file: fileName[i],
                    users: users[i],
                    language: language[i],
                    birthtime: file.birthtime.toString(),
                    updatetime: file.mtime.toString()
                }
            }
            res.json(infoOfSession);
        } catch (error) {
            console.log(error);
            return res.status(500).json('er');
        }
    }
}

module.exports = new sessionListController();