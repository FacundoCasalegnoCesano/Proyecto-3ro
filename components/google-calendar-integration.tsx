"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "./ui/button"

interface GoogleCalendarIntegrationProps {
  selectedDate: string
  onDateSelect: (date: string) => void
}

export function GoogleCalendarIntegration({ selectedDate, onDateSelect }: GoogleCalendarIntegrationProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Obtener el primer día del mes y cuántos días tiene
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    const isPast = clickedDate < today.setHours(0, 0, 0, 0)
    
    if (!isPast) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      onDateSelect(dateString)
    }
  }

  const isDateSelected = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return selectedDate === dateString
  }

  const isDatePast = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    return clickedDate < today.setHours(0, 0, 0, 0)
  }

  const isToday = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day)
    const todayDate = new Date()
    return clickedDate.toDateString() === todayDate.toDateString()
  }

  // Crear array de días para mostrar
  const calendarDays = []
  
  // Espacios vacíos para los días antes del primer día del mes
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-50 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <h3 className="text-lg font-semibold text-gray-800">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-50 bg-transparent"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName) => (
          <div key={dayName} className="text-center text-sm font-medium text-gray-500 py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-10" />
          }

          const isPast = isDatePast(day)
          const isSelected = isDateSelected(day)
          const isTodayDate = isToday(day)

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={isPast}
              className={`h-10 w-full rounded-md text-sm font-medium transition-all ${
                isSelected
                  ? "bg-babalu-primary text-white"
                  : isTodayDate
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : isPast
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-babalu-primary/10 hover:text-babalu-primary"
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-babalu-primary rounded"></div>
              <span>Seleccionado</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Hoy</span>
            </div>
          </div>
          <span>Integrado con Google Calendar</span>
        </div>
      </div>
    </div>
  )
}
