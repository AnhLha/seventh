import React, { useState, useEffect } from "react";
import '../../assets/css/home/home.css';
import { TR_TYPE_TIME, TR_TYPE_SETUP } from "../../constants/home/home.constant";
import { GET_LENGHT_LIST, START_CRAWL_DATA } from "../../action/home/home.action";
import { readFileExcel, createFileExcel } from "../../service/excel/excel.client.service";
import { useSelector, useDispatch } from 'react-redux';
import DatePicker, {registerLocale} from "react-datepicker";
import "../../../node_modules/react-datepicker/dist/react-datepicker";
import vi from 'date-fns/locale/vi';
registerLocale('vi',vi);

export default function Home() {
    const [mTime, setMTime] = useState(1);
    const [isTracking, setIsTracking] = useState(false);
    const [nameFile, setNameFile] = useState("");
    const [onBoarding, setOnBoarding] = useState(false);
    const [startDate, setStartDate] = useState(new Date);
    const dispatch = useDispatch();
    let listPhone = useSelector(state => state.home.listPhone);
    let phoneNumberChecking = useSelector(state => state.home.phoneNumberChecking);
    let sumIndex = useSelector(state => state.home.sumIndex);
    let isCrawlDone = useSelector(state => state.home.isCrawlDone);

    useEffect(() => {
        setIsTracking(!isCrawlDone);
    }, [isCrawlDone]);

    let readFile = (e) => {
        // console.log("name file is ", e.target.files[0].name);
        let nameFile = e.target.files[0].name;
        setNameFile(nameFile);
        readFileExcel(e.target.files[0], (data) => {
            setIsTracking(true);
            //data là mảng chứa danh sách thuê bao và số tiền
            dispatch({ type: GET_LENGHT_LIST, data: { sumIndex: data.length } });
            data.forEach((item, index) => {
                //Bỏ qua dòng đầu vì là tiêu đề
                if (index > 0) {
                    // console.log("data in file excel", item);
                    // dispatch({ type: SEND_NUMBER_TOSERVER, data: { phone: item[0], index: item[1] } });
                    let itemPhone = {
                        index: index,
                        phone: item[0]
                    }
                    listPhone.push(itemPhone);
                }
                if (index == (data.length - 1)) {
                    console.log("data - endoflist", item[0], " ", item[1], " listPhone", listPhone);
                    // dispatch({ type: START_CRAWL_DATA, data: { listPhone: listPhone, nameFile: nameFile.substring(0, nameFile.length - 5), time: mTime } });
                    // update here: dispatch startDate
                    dispatch({ type: START_CRAWL_DATA, data: { listPhone: listPhone, nameFile: nameFile.substring(0, nameFile.length - 5), startDate: startDate } });
                    setOnBoarding(true);
                }
            });
        });

        //phải cần dòng dưới, vì nếu như lần thứ hai chọn cùng 1 file, sẽ không được tính là opnchange, hàm onchange sẽ không gọi lại
        e.target.value = null;
    }

    let onInputTime = (e) => {
        setMTime(e.target.value);
    }

    let setUpTime = () => {
        // dispatch({ type: ADD_PHONE, data: { mTime: mTime } });
        dispatch({ type: ADD_PHONE, data: { startDate: startDate } });
    }

    let percentProcess = (index, sum) => {
        console.log("sum ", sum);
        return ((index / sum) * 100).toFixed(2);
    }

    let selectTime = (data) => {
        setStartDate(data);
    }

    return (
        <div className="crawl-login" id="div_craw">
            <div style={{
                position: "absolute",
                top: "20px",
                fontSize: "36px",
                fontWeight: "600"
            }}>BÁO CÁO TIÊU DÙNG - NẠP THẺ</div>
            {
                !isTracking ?
                    <div>
                        <div className="crawl-login">                          
                            <div className="input-add-div"> 
                                <DatePicker 
                                    className="input-add"
                                    showMonthYearPicker
                                    dateFormat="MM/yyyy"
                                    locale = "vi"
                                    selected = {startDate}
                                    onChange = {selectTime}/>
                                {/* <input className="input-add" type="number" min="1" max="60" defaultValue="1" placeholder={TR_TYPE_TIME} onChange={onInputTime} /> */}
                                <input className="input-add-button" type="button" value={TR_TYPE_SETUP} onClick={setUpTime} />
                            </div>
                            <div id="crawl_login_file_input_up">
                                {/* <img id="img_file_input" src='../assets/images/file.png' /> */}
                                <label htmlFor="xlsx">Bấm vào đây để chọn tệp(excel)</label>
                                <input type="file"
                                    id="xlsx" name="xlsx"
                                    accept="xlsx" onChange={readFile} />
                                <span id="span_file_input_error"></span>
                            </div>
                        </div>
                        {
                            isCrawlDone && onBoarding ?
                                <div style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    left: "50%",
                                    width: "100%",
                                    transform: 'translate(-50%, 10px)',
                                }} className="tracking-index-number-upper">
                                    <text>Tra cứu thành công , tên tệp đã crawl là <span style={{ color: "green" }}>{nameFile}</span></text>
                                </div>
                                :
                                null
                        }
                    </div>
                    :
                    null
            }
            {
                isTracking ?
                    <div>
                        <div className="animation-tracking">
                            <div className="crawl-loading-parent" id="div_loginin_loading">
                                <div className="crawl-login-loading">
                                    <div className="circle"></div>
                                    <div className="circle"></div>
                                    <div className="circle"></div>
                                    <div className="shadow"></div>
                                    <div className="shadow"></div>
                                    <div className="shadow"></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="tracking-index-number-upper">
                                <text>Đang tra cứu tệp <span style={{ color: "green" }}>{nameFile}</span></text>
                            </div>
                            <div className="tracking-index-number-upper">
                                <text style={{ textAlign: "center" }}>Đang tra cứu tới số thứ {phoneNumberChecking.index}</text>
                            </div>
                            <div className="tracking-index-number-bellow">
                                <text>Hoàn thành {percentProcess(phoneNumberChecking.index, sumIndex)}%</text>
                            </div>
                        </div>

                    </div>
                    :
                    null
            }
        </div>
    );
}