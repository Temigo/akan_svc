library(tidyverse)
library(lme4)
library(languageR)
library(DBI)
library(RSQLite)
library(blme)

theme_set(theme_bw())
theme(text = element_text(size=20))

# Open database
dbname <- "~/ling245b/database.db"
#dbname <- "~/ling245b/template/database0.db"
con = dbConnect(drv=dbDriver("SQLite"), dbname=dbname)
dbListTables(con)


# Get all tables
infos = dbGetQuery( con,'select * from infos' )
dbListFields(con, "infos")
practice = dbGetQuery(con, 'select * from practice')
preferences = dbGetQuery(con, 'select * from preferences')
videos = dbGetQuery(con, 'select * from videos')
users = dbGetQuery(con, 'select * from users')
systems = dbGetQuery(con, 'select * from systems')

# 1. only keep participants who completed experiment, i.e. who appear in table 'infos'
infos = subset(infos, user_id!="98xj34hvl") # remove test row
practice_filtered = inner_join(infos, practice, by='user_id')
videos_filtered = semi_join(videos, infos, by='user_id')
preferences_filtered = semi_join(preferences, infos, by='user_id')
users_filtered = semi_join(users, infos, by='user_id')
systems_filtered = semi_join(systems, infos, by='user_id')


#################################################################################
# 2. Some statistics on participants
summary(infos)

# Age
t = transform(infos, age = as.numeric(age))
summary(t)
ggplot(infos, aes(x=age)) +
  geom_bar(fill="steelblue") +
  xlab("Age") +
  ylab("Number of participants") +
  theme(text = element_text(size=20))

# Gender
ggplot(infos, aes(gender)) +
  geom_bar(fill="steelblue") +
  xlab("Gender") +
  ylab("Number of participants") +
  theme(text = element_text(size=20))

# Duration
ggplot(infos, aes(duration)) +
  geom_histogram()

# Confused?
ggplot(infos, aes(assess)) +
  geom_bar()

ggplot(systems_filtered, aes(os)) +
  geom_bar(fill="steelblue") +
  xlab("OS") +
  ylab("Number of participants") +
  theme(text = element_text(size=20))

#################################################################################
# 3. Count presses per video
practice_filtered$response_new <- str_remove_all(practice_filtered$response, "\\]|\\[|\\s+")
practice_filtered$response_new <- strsplit(practice_filtered$response_new, ",")
practice_filtered$response_count <- unlist(lapply(practice_filtered$response_new, length))

ggplot(practice_filtered, aes(x=response_count)) +
  geom_bar()

#################################################################################
# 4. Count presses in ROI in video = CLICKS
summary(videos_filtered)
summary(users_filtered)
videos_filtered$response_new <- str_remove_all(videos_filtered$response, "\\]|\\[|\\s+")
videos_filtered$response_new <- strsplit(videos_filtered$response_new, ",")
j <- 0
clicks <- data.frame("user_id"=NA, "group_id"=NA, "video_id"=NA, "time"=NA, "in_roi"=NA, "svc"=NA)
for (row in videos_filtered$response_new) {
  j <- j+1
  u_id <- videos_filtered$user_id[j]
  v_id <- videos_filtered$video_id[j]
  
  g_id <- users_filtered$group_id[users_filtered$user_id == u_id]
  svc <- FALSE
  if ((g_id == 1 & (v_id == 0 | v_id == 2 | v_id == 4)) | (g_id == 2 & (v_id == 1 | v_id == 3))) {
    svc <- TRUE
  }
  if (length(row) > 0) {
    for (i in 1:length(row)) {
      # print(as.numeric(row[i]))
      time <- as.numeric(row[i]) * 1000
      in_roi <- FALSE
      if (v_id == 0) {
        in_roi <- (time >= 23133 & time <= 27133) | (time >= 38221 & time <= 42221)
      }
      else if (v_id == 1) {
        in_roi <- time >= 35334 & time <= 43053
      }
      else if (v_id == 2) {
        in_roi <- time >= 25429 & time <= 33378
      }
      else if (v_id == 3) {
        in_roi <- time >= 33219 & time <= 39351
      }
      else if (v_id == 4) {
        in_roi <- time >= 20356 & time <= 26464
      }
      else {
        print("issue")
      }
      # InsertRow(clicks, c(u_id, v_id, in_roi, time))
      clicks <- rbind(clicks, c(u_id, g_id, v_id, time, in_roi, svc))
    }
  }
}
clicks <- clicks[-1,]
# Remove clicks at exactly time = 0?
# clicks <- clicks[clicks$time>0]

#################################################################################


# STATS count participants and exclusion rules
counting <- clicks %>%
  filter(in_roi == TRUE) %>%
  filter(group_id == 0) %>%
  group_by(user_id) %>%
  summarize(count=n())
counting
users_filtered %>%
  filter(group_id == 0)
## end of STAT

#################################################################################
# FIGURE Number of clicks vs in_roi and filled with group id
ggplot(clicks, aes(x=in_roi, fill=group_id)) +
  geom_bar() +
  xlab("In ROI or not") +
  ylab("Number of clicks") +
  theme(text = element_text(size=20)) +
  scale_fill_discrete(name="Group",
                      breaks=c(0, 1, 2),
                      labels=c("Control", "Exp 1", "Exp 2"))
#  guides(fill=guide_legend(title="Group"))

#################################################################################
# FIGURE total number of clicks in a video for a user
gd <- clicks %>%
  group_by(user_id, video_id) %>%
  tally()
ggplot(gd, aes(x=n)) +
  geom_histogram(binwidth=1, fill="steelblue") +
  xlab("Total number of clicks in a video") +
  ylab("Number of participants") +
  theme(text = element_text(size=20))

ggplot(clicks, aes(x=group_id)) +
  geom_bar() +
  xlab("Group id") +
  ylab("Number of clicks")

# Percentage of click in ROI, control vs exp
gd <- clicks %>%
  group_by(group_id, in_roi) %>%
  summarize(count=n())
gd <- gd %>%
  group_by(group_id) %>%
  mutate(count_nor=count/sum(count))
gd2 <- gd %>%
  filter(group_id == 1 | group_id == 2) %>%
  group_by(in_roi) %>%
  mutate(count=sum(count)) %>%
  filter(group_id == 1)
gd3 <- gd %>%
  filter(group_id == 0)
gd4 <- union(gd3, gd2) %>%
  filter(in_roi == TRUE)

ggplot(gd4, aes(x=group_id, y=count_nor)) +
  geom_bar(stat="identity") +
  xlab("Control vs experimental group") +
  ylab("Percentage of clicks in ROI")

ed <- clicks %>%
  group_by(user_id, in_roi) %>%
  summarize(count=n(), group_id=max(group_id))
ed <- ed %>%
  group_by(user_id) %>%
  mutate(total=sum(count)) %>%
  mutate(prop=count/max(total))
ed <- ed %>%
  filter(in_roi == TRUE)

ed1 <- ed %>%
  filter(group_id == 0) %>%
  group_by(in_roi) %>%
  mutate(new_group_id=min(group_id)) %>%
  mutate(mean=mean(prop))
ed2 <- ed %>%
  filter(group_id == 1 | group_id == 2) %>%
  group_by(in_roi) %>%
  mutate(new_group_id=min(group_id)) %>%
  mutate(mean=mean(prop))
ed3 <- union(ed1, ed2)


ggplot() +
  geom_jitter(aes(new_group_id, prop), data=ed3, colour=I("red"), position = position_jitter(width = 0.05)) +
  geom_crossbar(data=ed3, aes(x=new_group_id, y=mean, group=new_group_id, ymin=mean, ymax=mean), width=0.5) +
  scale_x_discrete(breaks=c(0, 1), labels=c("Control", "Experimental")) +
  xlab("Group") +
  ylab("Percentage of clicks inside ROI") +
  theme(text = element_text(size=20))

#################################################################################
# FIGURE Number of clicks in ROI er video per participant
fd <- clicks %>%
  filter(group_id == 1 | group_id == 2) %>%
  group_by(video_id, user_id) %>%
  filter(in_roi == TRUE) %>%
  summarize(count=n(), svc=all(svc))
fd <- fd %>%
  group_by(svc) %>%
  mutate(mean=mean(count), ymin=mean(count)-1./sqrt(n()), ymax=mean(count)+1./sqrt(n()))

ggplot() +
  #geom_jitter(aes(svc, count), data=fd, colour=I("red"), position = position_jitter(width = 0.05)) +
  geom_point(aes(svc, count), data=fd, colour=I("red"), position = position_jitter(w = 0.3, h = 0)) +
  geom_crossbar(data=fd, aes(x=svc, y=mean, group=svc, ymin=mean, ymax=mean), width=0.5, color="steelblue") +
  geom_errorbar(data=fd, aes(x=svc, ymin=ymin, ymax=ymax), width=0.2) +
  scale_x_discrete(breaks=c(FALSE, TRUE), labels=c("CC", "SVC")) +
  xlab("Prime") +
  ylab("Number of clicks inside ROI") +
  theme(text = element_text(size=20))

fd <- fd %>%
  group_by(user_id) %>%
  mutate(user_count=sum(count), count_proba=count/sum(count))

summary(fd)

fd <- within(fd, {
  video_id_new <- factor(video_id)
  user_id_new <- factor(user_id)
  svc_new <- factor(svc)
})
summary(fd)
# model <- lmer(count_proba ~ svc_new*user_count + (1|video_id_new), data=fd, family="binomial")
model <- glm(count ~ svc_new, family="poisson", data=fd)
model <- glmer(count ~ 1 + (1|video_id_new), family=poisson(link = "log"), data=fd)
model <- glmer(count ~ 1 + (1|user_id_new:video_id_new), family="poisson", data=fd)
summary(model)

# Null model
model <- blmer(count ~ 1 + (1|user_id_new) + (1|video_id_new), data=fd)
# Model
model <- blmer(count ~ svc_new + (1|user_id_new) , data=fd)
summary(model)

#################################################################################
# FIGURE Whether seeing a prime affected overall segmentation behavior
prime12 <- clicks %>%
  filter(group_id == 1 | group_id == 2) %>%
  group_by(user_id, video_id) %>%
  summarize(count=n(), svc=all(svc), prime=TRUE)

prime0 <- clicks %>%
  filter(group_id == 0) %>%
  group_by(user_id, video_id) %>%
  summarize(count=n(), svc=all(svc), prime=FALSE)

prime <- full_join(prime0, prime12)
prime <- prime %>%
  group_by(prime) %>%
  mutate(mean=mean(count), ymin=mean(count)-1./sqrt(n()), ymax=mean(count)+1./sqrt(n()))

ggplot() +
  #geom_jitter(aes(svc, count), data=fd, colour=I("red"), position = position_jitter(width = 0.05)) +
  # geom_point(aes(prime, count), data=prime, colour=I("red"), position = position_jitter(w = 0.05, h = 0.1)) +
  geom_crossbar(data=prime, aes(x=prime, y=mean, group=prime, ymin=mean, ymax=mean), width=0.5, color="steelblue") +
  geom_errorbar(data=prime, aes(x=prime, ymin=ymin, ymax=ymax), width=0.2) +
  scale_x_discrete(breaks=c(0, 1), labels=c("Control", "Experimental")) +
  xlab("Whether a prime was shown or not") +
  ylab("Number of clicks in a video") +
  theme(text = element_text(size=20))


prime <- within(prime, {
  video_id_new <- factor(video_id)
  user_id_new <- factor(user_id)
  prime_new <- factor(prime)
})
summary(prime)
prime <- prime %>%
  group_by(user_id, video_id) %>%
  mutate(user_count=sum(count), count_norm=count/sum(count))

#model <- glmer(prime_new ~ count + (1|user_id_new), data=prime, family="binomial")
#summary(model)

model <- glmer(count ~ prime_new + (1|video_id_new) + (1|user_id_new), family="poisson", data=prime)
beta(model)
summary(model)

#model <- blmer(count_norm ~ prime_new + (1|user_id_new) + (1|video_id_new), data=prime)
#summary(model)

#################################################################################
# Preferences

ggplot(preferences_filtered, aes(x=preference)) +
  geom_bar()

preferences_filtered %>% 
  group_by(preference) %>%
  summarize(count=n())

new_preferences <- preferences_filtered %>% 
  group_by(preference) %>%
  mutate(count=n(), mean=mean(duration), ymin=mean(duration)-1./sqrt(n()), ymax=mean(duration)+1./sqrt(n()))

new_preferences <- within(new_preferences, {
  user_id_new <- factor(user_id)
  video_id_new <- factor(video_id)
  preference_new <- factor(preference)
})
summary(new_preferences)

# Null model
model <- glmer(preference_new ~ 1 + (1|user_id_new) + (1|video_id_new), family="binomial", data=new_preferences)
# Real model
model <- glmer(preference_new ~ duration + (1|user_id_new) + (1|video_id_new), family="binomial", data=new_preferences)

summary(model)

ggplot(new_preferences, aes(preference, duration)) +
  geom_point(aes(colour=preference_new)) +
  geom_crossbar(data=new_preferences, aes(x=preference, y=mean, group=preference, ymin=mean, ymax=mean), width=0.5, color="steelblue") + 
  geom_errorbar(data=new_preferences, aes(x=preference, ymin=ymin, ymax=ymax), width=0.2) +
  xlab("Preference") +
  ylab("Duration (min)")  +
  scale_x_discrete(breaks=c("cc", "svc"), labels=c("CC", "SVC")) +
  theme(text = element_text(size=20)) +
  theme(legend.position = "none")

#################################################################################
# Anonymize data and save for github
users_anon <- select(users_filtered, user_id, group_id, timestamp)
save(users_anon, clicks, infos, practice_filtered, preferences_filtered, systems_filtered, videos_filtered, file="data.RData")
# Close connection
dbDisconnect(con)
