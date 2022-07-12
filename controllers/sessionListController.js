const {SessionList, connection, Session} = require('../models/models');

class sessionListController {

    // "добавляем" сессию в список сессий пользователя

    async addConnection(req, res) {
        try {
            const { sessionId } = req.body;
            const user = req.user;
            const sessionList = await SessionList.findOne({where: {userId: user}});
            await connection.create({sessionListId: sessionList.id, sessionId: sessionId});
            res.json("Соединение создано!");
        } catch (error) {
            console.log(error);
            return res.status(500).json('errrr');
        }
    }

    // удаляем сессию из списка сессий
    // здесь еще нужно сделать проверку на тот случай, если ни в одном списке данной сессии не будет, если так, то удалять ее и файл

    async removeConnection(req, res) {
        try {
            const stat = req.body.stat;
            const session = await Session.findOne({where: {sessionStatic: stat}});
            const conn = await connection.findOne({where: {sessionId: session.id}});
            await conn.destroy();
            const result = await connection.findAll();
            res.json(result);
        } catch (error) {
            console.log(error);
            return res.status(500).json('er');
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
            res.json(allFiles);
        } catch (error) {
            console.log(error);
            return res.status(500).json('er');
        }
    }
}

module.exports = new sessionListController();