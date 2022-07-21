const {Session, SessionList, connection} = require('../models/models');

class sessionController {

    /**
     * Создание сессии и соединения
     * @param {string} fileName - Название файла
     * @param {string} user - User ID
     * Если сессия создана, проверяем создано ли соединение, создаем если его нет
     * В противном случае создаем сессию и соединение
     */

    async createSession(req, res) {
        try {
            const fileName = req.body.id;
            const user = req.user;
            const candidate = await Session.findOne({where: {sessionStatic: fileName}});
            if (candidate) {
                const sessionList = await SessionList.findOne({where: {userId: user}});
                const candidateConnection = await connection.findOne({where: {sessionId: candidate.id}});
                if (!candidateConnection) {
                    await connection.create({sessionListId: sessionList.id, sessionId: candidate.id});
                    return res.status(200).json({message: "Соединение установлено!"});
                } else { return res.status(200).json({message: "Соединение уже существует!"}); }
            } else {
                const session = await Session.create({
                    abilityToEdit: true,
                    language: 'javascript',
                    users: [],
                    sessionStatic: fileName
                });
                const sessionList = await SessionList.findOne({where: {userId: user}});
                await connection.create({sessionListId: sessionList.id, sessionId: session.id});
                return res.status(200).json({message: "Сессия и соединение установлены!"});
            }
        } catch(e) {
            console.log(e);
            return res.status(500).json('error');
        }
    }
}

module.exports = new sessionController();