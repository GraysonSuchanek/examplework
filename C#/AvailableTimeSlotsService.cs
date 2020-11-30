using Project.Data;
using Project.Data.Providers;
using Project.Models;
using Project.Models.Domain;
using Project.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;

namespace Project.Services
{
    public class AvailableTimeSlotsService : IAvailableTimeSlotsService
    {
        IDataProvider _data = null;
        public AvailableTimeSlotsService(IDataProvider data)
        {
            _data = data;
        }

        public Paged<AvailableTimeSlot> GetAll(int pageIndex, int pageSize, int sessionDuration)
        {
            Paged<AvailableTimeSlot> page = null;
            List<AvailableTimeSlot> list = null;
            int totalCount = 0;

            _data.ExecuteCmd("[dbo].[ScheduleAvailability_Select_NextFiveAvailable]"
                , delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@pageIndex", pageIndex);
                col.AddWithValue("@pageSize", pageSize);
                col.AddWithValue("@sessionDuration", sessionDuration);
            }
                , delegate (IDataReader reader, short set)
                {
                    AvailableTimeSlot availableTimeSlot = MapAvailableTimeSlot(reader, out int  index);

                    if (list == null)
                    {
                        list = new List<AvailableTimeSlot>();
                    }
                    if (totalCount == 0)
                    {
                        totalCount = reader.GetSafeInt32(index++);
                    }
                    list.Add(availableTimeSlot);
                });

            if (list != null)
            {
                page = new Paged<AvailableTimeSlot>(list, pageIndex, pageSize, totalCount);
            }
            return page;
        }

        private static AvailableTimeSlot MapAvailableTimeSlot(IDataReader reader, out int index)
        {
            AvailableTimeSlot availableTimeSlot = new AvailableTimeSlot();
             index = 0;
            availableTimeSlot.BlockStart = reader.GetSafeDateTime(index++);
            availableTimeSlot.BlockEnd = reader.GetSafeDateTime(index++);

            return availableTimeSlot;
        }
    }
}
