import { useContext, useEffect, useState } from "react";
import * as S from "./styled";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

const ScheduleList = () => {
  const { userRole } = useContext(AuthContext); // 사용자 역할 정보 가져오기

  const currentTime = Date.now();
  const currentMonth = new Date().getMonth() + 1;
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [schedules, setSchedules] = useState([]);

  const navigate = useNavigate();

  const handleAttendanceClick = (event, id) => {
    event.preventDefault();
    navigate(`/schedule/rtattendance/${id}`);
  };

  useEffect(() => {
    fetchData(currentMonth);
  }, []);

  const fetchData = async (month) => {
    try {
      const schedules = await axios.get(
        `http://localhost:4000/schedule?month=${month}`
      );

      setSchedules(schedules.data);
    } catch (error) {
      console.error("에러 발생");
    }
  };

  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  const handleMonthSelect = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    fetchData(month);
  };

  return (
    <>
      <S.Title>일정/결과</S.Title>
      <S.HorizontalLine />
      <S.Container>
        <S.DateContainer>
          <S.Select>
            <S.Option value='2023'>2023</S.Option>
          </S.Select>
          <S.Year>년</S.Year>
          <S.Select value={selectedMonth} onChange={handleMonthSelect}>
            {monthOptions.map((month) => (
              <S.Option key={month} value={month}>
                {month}
              </S.Option>
            ))}
          </S.Select>
          <S.Month>월</S.Month>
        </S.DateContainer>
        {schedules.length === 0 ? (
          <S.EmptyNotice>아직 등록된 일정이 없습니다.</S.EmptyNotice>
        ) : (
          schedules.map((schedule) => (
            <S.MatchBox key={schedule.ID} to={`/schedule/${schedule.ID}`}>
              <S.MatchCalendar>
                <S.MatchDate>
                  {new Date(schedule.DATE).toLocaleDateString()}
                </S.MatchDate>
                <S.MatchTime>
                  {new Date(schedule.DATE).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </S.MatchTime>
              </S.MatchCalendar>
              <S.TeamGroup>
                <S.HomeTeam>FC TOP</S.HomeTeam>
                <S.VersusGroup>
                  <S.Versus>VS</S.Versus>
                  <S.Round>{getWeekNumber(new Date(schedule.DATE))}R</S.Round>
                </S.VersusGroup>
                <S.AwayTeam>{schedule.OPPONENT}</S.AwayTeam>
              </S.TeamGroup>
              <S.MatchPlace>
                {schedule.LOCATION === "직접 입력"
                  ? schedule.CUSTOM_LOCATION
                  : schedule.LOCATION}
              </S.MatchPlace>
              {new Date(schedule.DATE) > currentTime ? (
                <S.AttendanceBtn
                  onClick={(event) => handleAttendanceClick(event, schedule.ID)}
                >
                  출석
                </S.AttendanceBtn>
              ) : (
                <S.BtnGroup>
                  <S.VideoBtn>경기 영상</S.VideoBtn>
                  <S.RecordBtn>경기 기록</S.RecordBtn>
                </S.BtnGroup>
              )}
            </S.MatchBox>
          ))
        )}
        {userRole === "MASTER" || userRole === "CAPTAIN" ? (
          <S.UploadBtn to='/schedule/register'>일정 등록</S.UploadBtn>
        ) : null}
      </S.Container>
    </>
  );
};

export default ScheduleList;
