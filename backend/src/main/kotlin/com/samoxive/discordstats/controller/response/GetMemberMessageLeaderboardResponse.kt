package com.samoxive.discordstats.controller.response

data class GetMemberMessageLeaderboardResponse (
    val data: List<MemberMessageCount>
)

data class MemberMessageCount(
    val member: MemberDto,
    val count: Int
)