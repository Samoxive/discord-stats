package com.samoxive.discordstats.controller.response

import net.dv8tion.jda.api.entities.Member

data class MemberDto(
    val id: String,
    val name: String,
    val nickname: String?,
    val avatarUrl: String
)

fun Member.toDto() = MemberDto(id, user.asTag, nickname, user.effectiveAvatarUrl)