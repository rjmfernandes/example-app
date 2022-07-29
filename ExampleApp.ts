import {
    IAppAccessors,
    IConfigurationExtend,
    IModify,
    ILogger,
    IHttp, IPersistence, IRead
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPreMessageSentPrevent, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import {HelloWorldCommand } from './Commands/HelloWorldCommand';
import {OpenCtxBarCommand, createContextualBarBlocks} from './Commands/CtxbarExampleApp';
import { ISectionBlock, IUIKitInteractionHandler, IUIKitResponse, UIKitActionButtonInteractionContext, UIKitBlockInteractionContext, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { UIActionButtonContext } from '@rocket.chat/apps-engine/definition/ui/UIActionButtonContext';
import { HTTPRequestCommand } from './Commands/HTTPRequestCommand';
import { Endpoint } from './endpoint/Endpoint';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';

export class ExampleApp extends App implements IPreMessageSentPrevent, IPostMessageSent, IUIKitInteractionHandler {
    private readonly appLogger: ILogger;
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.appLogger = this.getLogger();
        this.appLogger.debug('Hello, World! Second time!');
    }

    public async extendConfiguration(
        configuration: IConfigurationExtend
      ): Promise<void> {
        const helloWorldCommand: HelloWorldCommand = new HelloWorldCommand()
        await configuration.slashCommands.provideSlashCommand(helloWorldCommand)
        await configuration.slashCommands.provideSlashCommand(
            new OpenCtxBarCommand(this),
        )
        await configuration.slashCommands.provideSlashCommand(new HTTPRequestCommand())
        configuration.ui.registerButton({
            actionId: 'my-action-id', // this identifies your button in the interaction event
            labelI18n: 'my-action-name', // key of the i18n string containing the name of the button
            context: UIActionButtonContext.ROOM_ACTION, // in what context the action button will be displayed in the UI
        });
        configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new Endpoint(this)],
        });
      }

    public async executePreMessageSentPrevent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence): Promise<boolean> {
        if (message.room.slugifiedName === 'general') {
            return false;
        }
        if(message.text === 'test') {
            return true;
        }
        return false;
    }

    public async executePostMessageSent(message: IMessage, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
        if (message.room.slugifiedName === 'general') {
            return;
        }

        const general = await read.getRoomReader().getByName('general');
        const messageBuilder = modify.getCreator().startMessage({
            text: `@${message.sender.username} said "${message.text}" in #${message.room.displayName}`,
        } as IMessage);

        if (!general) {
            return;
        }
        messageBuilder.setRoom(general);
        await modify.getCreator().finish(messageBuilder);
    }

    public async executeBlockActionHandler(context: UIKitBlockInteractionContext, _read: IRead, _http: IHttp, _persistence: IPersistence, modify: IModify) {
        const data = context.getInteractionData();

        const contextualbarBlocks = createContextualBarBlocks(modify, data.container.id);

        // [9]
        await modify.getUiController().updateContextualBarView(contextualbarBlocks, { triggerId: data.triggerId }, data.user);

        return {
            success: true,
        };
    }

    // [10]
    public async executeViewSubmitHandler(context: UIKitViewSubmitInteractionContext): Promise<IUIKitResponse> {
        const data = context.getInteractionData()

        // [11]
        const text = (data.view.blocks[0] as ISectionBlock).text.text;

        // [12]
        console.log(text);

        return {
            success: true,
        };
    }

    public async executeActionButtonHandler(
        context: UIKitActionButtonInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const {
            buttonContext,
            actionId,
            triggerId,
            user,
            room,
            message
        } = context.getInteractionData();

        // If you have multiple action buttons, use `actionId` to determine
        // which one the user interacted with
        if (actionId === 'my-action-id') {
            const blockBuilder = modify.getCreator().getBlockBuilder();

            return context.getInteractionResponder().openModalViewResponse({
                title: blockBuilder.newPlainTextObject('Interaction received'),
                blocks: blockBuilder.addSectionBlock({
                    text: blockBuilder.newPlainTextObject('We received your interaction, thanks!')
                }).getBlocks()
            });
        }

        return context.getInteractionResponder().successResponse();
    }

}
