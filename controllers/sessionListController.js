const {SessionList, connection, Session} = require('../models/models');
const fs = require('fs');
const path = require('path');

class sessionListController {

    // "добавляем" сессию в список сессий пользователя

    async addConnection(req, res) {
        try {
            const { sessionId } = req.body;
            const user = req.user;
            const sessionList = await SessionList.findOne({where: {userId: user}});
            const candidate = await connection.findOne({where: {sessionId: sessionId}});
            if (candidate) return res.json("Соединение уже существует!");
            else { 
                await connection.create({sessionListId: sessionList.id, sessionId: sessionId});
                res.json("Соединение создано!");
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json('errrr');
        }
    }

    // удаляем сессию из списка сессий

    async removeConnection(req, res) {
        try {
            const stat = req.body.stat;
            const user = req.user;
            const sessionList = await SessionList.findOne({where: {userId: user}});
            const session = await Session.findOne({where: {sessionStatic: stat}});
            const conn = await connection.findOne({where: {sessionListId: sessionList.id, sessionId: null}});
            if (conn) await conn.destroy();
            const result = await connection.findAll({where: {sessionId: session.id}});
            if (result) {
                await session.destroy();
                fs.unlink(path.resolve(__dirname, '..', 'files', stat));
            }
            fs.unlinkSync((path.resolve(__dirname, '..', 'files', `${stat}`)), () => {
                console.log('File deleted successfully!');
            });
            res.json("Соединение удалено!");
        } catch (error) {
            console.log(error);
            return res.status(500).json('Соединение не найдено!');
        }
    }

    // получаем все сессии для списка сейссий 

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
            let result = [];
            allFiles.forEach(element => {
                result = [...result, element.sessionStatic];
            });
            res.json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json('er');
        }
    }
}

module.exports = new sessionListController();