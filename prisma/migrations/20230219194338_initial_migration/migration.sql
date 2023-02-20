-- CreateTable
CREATE TABLE "tournament_settings" (
    "id" UUID NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "sending_mode" TEXT,
    "ab_channel" TEXT,
    "rb_channel" TEXT,
    "sb_channel" TEXT,

    CONSTRAINT "tournament_settings_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "tournaments_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournament_settings_pk2" ON "tournament_settings"("guild_id");
