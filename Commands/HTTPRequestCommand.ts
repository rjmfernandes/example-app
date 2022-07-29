import {
    IHttp,
    IModify,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';

export class HTTPRequestCommand implements ISlashCommand {
    public command = 'get'; // [1]
    public i18nParamsExample = '';
    public i18nDescription = '';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp): Promise<void> {
        const [url] = context.getArguments(); // [2]

        if (!url) { // [3]
            throw new Error('Error!');
        }

        const response = await http.get(url);
        const message = JSON.stringify(response.data, null, 2); // [2]
        await this.sendMessage(context, modify, message); // [3]
    }

    private async sendMessage(context: SlashCommandContext, modify: IModify, message: string): Promise<void> {
        const messageStructure = modify.getCreator().startMessage();
        const sender = context.getSender(); // [1]
        const room = context.getRoom(); // [2]

        messageStructure
        .setSender(sender)
        .setRoom(room)
        .setText(message); // [3]

        await modify.getCreator().finish(messageStructure); // [4]
    }
}
