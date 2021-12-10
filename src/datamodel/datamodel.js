import { ChannelSchema } from "./schema";

const REALM_ID = "form";

class Channel {
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