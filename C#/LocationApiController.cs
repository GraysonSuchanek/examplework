using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Project.Models;
using Project.Models.Domain;
using Project.Models.Domain.Locations;
using Project.Models.Requests.Location;
using Project.Services;
using Project.Web.Controllers;
using Project.Web.Models.Responses;
using System;
using System.Collections.Generic;

namespace Project.Web.Api.Controllers
{
    [Route("api/locations")]
    [ApiController]
    public class LocationApiController : BaseApiController
    {
        private IAuthenticationService<int> _authService = null;
        private ILocationService _service = null;
        private ILookUpService _lookUpService = null;

        public LocationApiController(
            ILocationService service
            , ILookUpService lookUpService
            , ILogger<LocationApiController> logger
            , IAuthenticationService<int> authService) : base(logger)
        {
            _service = service;
            _authService = authService;
            _lookUpService = lookUpService;
        }

        [HttpPost]
        public ActionResult<ItemResponse<int>> Create(LocationAddRequest model) {
            ObjectResult result = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                int id = _service.Add(model, userId);
                ItemResponse<int> response = new ItemResponse<int>() { Item = id };

                result = Created201(response);
            }
            catch (Exception error)
            {
                Logger.LogError(error.ToString());
                ErrorResponse response = new ErrorResponse(error.Message);

                result = StatusCode(500, response);
            }
            return result;
        }

        [HttpPut("{id:int}")]
        public ActionResult<SuccessResponse> Update(LocationUpdateRequest model)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                int userId = _authService.GetCurrentUserId();
                _service.Update(model, userId);

                response = new SuccessResponse();
            }
            catch (Exception error)
            {
                code = 500;
                response = new ErrorResponse(error.Message);
            }
            return StatusCode(code, response);
        }

        [HttpGet("{id:int}")]
        public ActionResult<ItemResponse<Location>> GetById(int id)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Location loc = _service.GetById(id);

                if (loc == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<Location> { Item = loc };
                }
            }
            catch (Exception error)
            {
                code = 500;
                base.Logger.LogError(error.ToString());
                response = new ErrorResponse(error.Message);
            }
            return StatusCode(code, response);
        }

        [HttpGet("paginate")]
        public ActionResult<ItemResponse<Paged<Location>>> Get(int pageIndex, int pageSize)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Paged<Location> page = _service.GetAll(pageIndex, pageSize);
                if (page == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource Not Found.");
                }
                else
                {
                    response = new ItemResponse<Paged<Location>> { Item = page };
                }
            }
            catch (Exception error)
            {
                code = 500;
                response = new ErrorResponse(error.Message);
                base.Logger.LogError(error.ToString());
            }
            return StatusCode(code, response);
        }

        [HttpGet("createdBy")]
        public ActionResult<ItemResponse<Paged<Location>>> GetCreatedBy(int pageIndex, int pageSize, int createdBy)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                Paged<Location> page = _service.GetByCreatedBy(pageIndex, pageSize, createdBy);
                if (page == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource Not Found.");
                }
                else
                {
                    response = new ItemResponse<Paged<Location>> { Item = page };
                }
            }
            catch (Exception error)
            {
                code = 500;
                response = new ErrorResponse(error.Message);
                base.Logger.LogError(error.ToString());
            }
            return StatusCode(code, response);
        }

        [HttpGet("radius")]
        public ActionResult<ItemsResponse<Location>> GetRadius(double lat, double lon, double radius)
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<Location> list = _service.GetByRadius(lat, lon, radius);

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource Not Found.");
                }
                else
                {
                    response = new ItemsResponse<Location> { Items = list };
                }
            }
            catch (Exception error)
            {
                code = 500;
                response = new ErrorResponse(error.Message);
                base.Logger.LogError(error.ToString());
            }
            return StatusCode(code, response);
        }

        [HttpGet("states")]
        public ActionResult<ItemResponse<List<State>>> GetStates()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                List<State> list = _service.GetStates();

                if (list == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource Not Found.");
                }
                else
                {
                    response = new ItemResponse<List<State>>() { Item = list };
                }
            }
            catch (Exception error)
            {
                code = 500;
                response = new ErrorResponse(error.Message);
                base.Logger.LogError(error.ToString());
            }
            return StatusCode(code, response);
        }

        [HttpGet("types"), AllowAnonymous]
        public ActionResult<ItemResponse<object>> GetTypes()
        {
            int code = 200;
            BaseResponse response = null;

            try
            {
                LocationList locationList = new LocationList();

                locationList.LocationType = _lookUpService.GetEntity("location");
                locationList.State = _service.GetStates();

                if (locationList == null)
                {
                    code = 404;
                    response = new ErrorResponse("Application Resource not found.");
                }
                else
                {
                    response = new ItemResponse<object> { Item = locationList };
                }
            }
            catch (Exception error)
            {
                code = 500;
                base.Logger.LogError(error.ToString());
                response = new ErrorResponse(error.Message);
            }
            return StatusCode(code, response);
        }
    }
}
