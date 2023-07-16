export enum MessageType {
	Request,
	ResponseWorkerReady,
	ResponseSuccess,
	ResponseFailure,
}

export interface Message {
	readonly id: number
	readonly type: MessageType
	readonly body: any
}
