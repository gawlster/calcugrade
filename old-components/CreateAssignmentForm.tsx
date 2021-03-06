import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import ParseDate from '../hooks/ParseDate'
import { AssignmentType } from '../Types'
import CustomInput from '../components/CustomInput'
import CustomLabel from '../components/CustomLabel'

const CreateAssignmentForm: React.FC<{
    cid: string
    _close: () => void
    _update: () => void
    prevData?: { taskID: string; courseID: string; taskName: string }
}> = ({ cid, _close, _update, prevData }) => {
    const [loadingForm, setLoadingForm] = useState(true)

    const [isPrevData, setIsPrevData] = useState(false)

    const [loading, setLoading] = useState<boolean>(false)
    const [userID, setUserID] = useState<string>('')

    const [percentageOfFinalErr, setPercentageOfFinalErr] = useState<boolean>(false)
    const [gradeErr, setGradeErr] = useState<boolean>(false)

    const [confirmCancel, setConfirmCancel] = useState<boolean>(false)

    const [assignmentName, setAssignmentName] = useState<string>('')
    const [percentageOfFinal, setPercentageOfFinal] = useState<number>(0)
    const [status, setStatus] = useState<'graded' | 'submitted' | 'todo'>('todo')
    const [dueDate, setDueDate] = useState<Date>(new Date())
    const [grade, setGrade] = useState<number>(0)

    useEffect(() => {
        async function getData() {
            const curUserID = localStorage.getItem('curUserID')
            if (curUserID) {
                setUserID(curUserID)
            } else {
                window.location.pathname = '/auth/login'
            }
            if (prevData) {
                // updating here
                const res = await axios.post('/api/GetAssignmentDetails', {
                    uid: curUserID,
                    cid: prevData.courseID,
                    aid: prevData.taskID,
                })
                const data: AssignmentType = res.data
                setAssignmentName(data.assignmentName)
                setPercentageOfFinal(data.percentageOfFinal)
                setStatus(data.status)
                setDueDate(ParseDate(data.dueDate))
                setGrade(data.grade)
                setIsPrevData(true)
            }
            setLoadingForm(false)
        }
        getData()
    }, [])

    function cancelCreateAssignment() {
        setAssignmentName('')
        setPercentageOfFinal(0)
        setStatus('todo')
        setDueDate(new Date())
        setGrade(0)

        setConfirmCancel(false)

        _close()
        _update()
    }

    async function calcEarnedOfFinal(percentageOfFinal: number, grade: number) {
        if (percentageOfFinal === 0) return 0
        if (grade === 0) return 0
        return grade * (percentageOfFinal / 100)
    }

    function handleNumberInput(
        e: any,
        val: number,
        _update: (v: number) => void,
        _err: (b: boolean) => void
    ) {
        _err(false)
        const numberInput = Number(e.target.value)
        if (!isNaN(numberInput)) {
            _update(numberInput)
        } else {
            _err(true)
        }
    }

    async function handleSubmit(e: any) {
        e.preventDefault()
        setLoading(true)
        const earnedOfFinal = await calcEarnedOfFinal(percentageOfFinal, grade)
        if (isPrevData && prevData) {
            // update instead of add
            const toSend = {
                userID: userID,
                courseID: cid,
                assignmentID: prevData.taskID,
                assignmentName: assignmentName,
                percentageOfFinal: percentageOfFinal,
                status: status,
                dueDate: dueDate,
                grade: grade,
                earnedOfFinal: earnedOfFinal,
            }
            const res = await axios.post('/api/UpdateAssignment', toSend)
        } else {
            // add new assignment
            const toSend = {
                userID: userID,
                courseID: cid,
                assignmentName: assignmentName,
                percentageOfFinal: percentageOfFinal,
                status: status,
                dueDate: dueDate,
                grade: grade,
                earnedOfFinal: earnedOfFinal,
            }
            const res = await axios.post('/api/PostNewAssignment', toSend)
        }

        setLoading(false)
        _close()
        _update()
    }

    return (
        <div className='bg-white absolute z-40 top-0 left-0 right-0 bottom-0 min-w-screen min-h-screen flex flex-col gap-3 text-lg items-center justify-center'>
            {loadingForm ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <div className='text-xl font-semibold'>
                        {prevData
                            ? `Updating grades for ${prevData.taskName}`
                            : 'Add an assignment'}
                    </div>
                    <div>
                        <form
                            onSubmit={(e) => handleSubmit(e)}
                            action='#'
                            className='flex flex-col gap-2 border p-8 w-fit'>
                            <CustomLabel>
                                Assignment name:
                                <CustomInput
                                    type='text'
                                    value={assignmentName}
                                    onChange={(e) => setAssignmentName(e.target.value)}
                                />
                            </CustomLabel>
                            <CustomLabel>
                                Due date:
                                <DatePicker
                                    selected={dueDate}
                                    onChange={(date: Date) => setDueDate(date)}
                                />
                            </CustomLabel>
                            <CustomLabel>
                                Status:
                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value as 'todo' | 'submitted' | 'graded')
                                    }>
                                    <option value='todo'>Todo</option>
                                    <option value='submitted'>Submitted</option>
                                    <option value='graded'>Graded</option>
                                </select>
                            </CustomLabel>
                            <CustomLabel>
                                Percentage of final grade:
                                <CustomInput
                                    type='text'
                                    value={percentageOfFinal}
                                    onChange={(e) =>
                                        handleNumberInput(
                                            e,
                                            percentageOfFinal,
                                            setPercentageOfFinal,
                                            setPercentageOfFinalErr
                                        )
                                    }
                                />
                            </CustomLabel>
                            {status !== 'todo' && (
                                <CustomLabel>
                                    {status === 'graded' ? 'Grade:' : 'Expected grade:'}
                                    <CustomInput
                                        type='text'
                                        value={grade}
                                        onChange={(e) =>
                                            handleNumberInput(e, grade, setGrade, setGradeErr)
                                        }
                                    />
                                </CustomLabel>
                            )}
                            <div className='flex flex-row gap-2'>
                                <button
                                    className='rounded transition-colors border-2 border-orange-600 text-orange-600 px-2 py-1 font-bold hover:border-transparent hover:text-white hover:bg-orange-600'
                                    type='submit'>
                                    {loading ? 'Loading...' : 'Submit'}
                                </button>
                                <button onClick={() => setConfirmCancel(true)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmCancel && (
                <div className='p-8 w-1/3 bg-gray-200 absolute bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 flex flex-col gap-2 items-center'>
                    <h1>Are you sure you want to cancel? All progress will be lost.</h1>
                    <div className='flex flex-row gap-2'>
                        <button
                            onClick={() => {
                                cancelCreateAssignment()
                            }}
                            className='transition-colors text-green-600 font-bold border border-green-600 px-2 hover:border-transparent hover:text-white hover:bg-green-600'>
                            Yes, cancel
                        </button>
                        <button onClick={() => setConfirmCancel(false)} className='text-red-500'>
                            No, keep working
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateAssignmentForm
