import client from "../../client";
import { uploadToS3 } from "../../shared/shared.utils";
import { protectedResolver } from "../../users/users.utils";
import { processHashtags } from "../photos.utils";

const resolverFn = async (_, { file, caption }, { loggedInUser }) => {
    let hashtagObjs = [];
    if (caption) {
        hashtagObjs = processHashtags(caption);
    };
    const fileUrl = await uploadToS3(file, loggedInUser.id, "uploads");
    return client.photo.create({
        data: {
            file: fileUrl, 
            ...(caption && { caption }), 
            user: {
                connect: {
                    id: loggedInUser.id
                }
            }, 
            ...(hashtagObjs.length > 0 && {
                hashtags: {
                    connectOrCreate: hashtagObjs
                }
            })
        }
    });
};

export default {
    Mutation: {
        uploadPhoto: protectedResolver(resolverFn)
    }
};