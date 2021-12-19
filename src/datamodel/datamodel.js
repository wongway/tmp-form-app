import { ChannelSchema } from "./schema";

const REALM_ID = "form";

export class Channel {
    constructor ({
        name,
        id = new ObjectId(),
    }) {
        this._id = id;
        this.realm_id = REALM_ID;
        this.name = name;
    }

    static schema = ChannelSchema;
}

// export { Channel };