import environment from "./environment";

export type TextChannel = {
    id: string;
    name: string;
};

export type Guild = {
    id: string;
    name: string;
    iconUrl: string;
    channels: TextChannel;
};

export async function fetchGuilds(): Promise<Guild[]> {
    const response = await fetch(environment.apiUrl + "/guilds");
    return await response.json();
}

export type MessageStatistics = {
    channels: TextChannel[];
    timePoints: number[];
    dataPoints: number[][];
};

export async function fetchMessageStatistics(
    guildId: string,
    startTime: number,
    endTime: number
): Promise<MessageStatistics> {
    const response = await fetch(
        environment.apiUrl +
            `/guilds/${guildId}/messageStatistics?startTime=${startTime}&endTime=${endTime}`
    );
    return await response.json();
}

export type ChannelMessageCount = {
    channel: TextChannel;
    count: number;
};

export type ChannelMessageLeaderboard = {
    data: ChannelMessageCount[];
};

export async function fetchChannelMessageLeaderboard(
    guildId: string,
    startTime: number,
    endTime: number
): Promise<ChannelMessageLeaderboard> {
    const response = await fetch(
        environment.apiUrl +
            `/guilds/${guildId}/channelMessageLeaderboard?startTime=${startTime}&endTime=${endTime}`
    );
    return await response.json();
}

export type Member = {
    id: string;
    name: string;
    nickname?: string;
    avatarUrl: string;
};

export type MemberMessageCount = {
    member: Member;
    count: number;
};

export type MemberMessageLeaderboard = {
    data: MemberMessageCount[];
};

export async function fetchMemberMessageLeaderboard(
    guildId: string,
    startTime: number,
    endTime: number
): Promise<MemberMessageLeaderboard> {
    const response = await fetch(
        environment.apiUrl +
            `/guilds/${guildId}/memberMessageLeaderboard?startTime=${startTime}&endTime=${endTime}`
    );
    return await response.json();
}
