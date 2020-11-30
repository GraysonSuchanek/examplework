ALTER PROC [dbo].[ScheduleAvailability_Select_NextFiveAvailable]
		@pageIndex int,
		@pageSize int,
		@sessionDuration int

AS

/*

	DECLARE	
		@pageIndex int = 0,
		@pageSize int = 5,
		@sessionDuration int = 60

	EXECUTE	[dbo].[ScheduleAvailability_Select_NextFiveAvailable]
		@pageIndex,
		@pageSize,
		@sessionDuration
*/

BEGIN

	DECLARE		@offset int = @pageIndex * @pageSize,
				@sessionPrepTime int = 30,
				@driveTime int = 30,
				@blockStart datetime2 = null,
				@blockEnd datetime2,
				@Counter int = 1,
				@BeginningDate datetime2 = dateadd(day, datediff(day, -11, GETUTCDATE()), 0)

	DECLARE		@StartAndEndOfDay TABLE (
						StartTime datetime2,
						EndTime datetime2
				);

	WHILE @Counter <= 21
		BEGIN
			INSERT INTO @StartAndEndOfDay (
					StartTime,
					EndTime
			) VALUES ( 
					DATEADD(HOUR, 21, DATEADD(DAY, @Counter, @BeginningDate)),
					DATEADD(HOUR, 9, DATEADD(DAY, @Counter + 1, @BeginningDate))
			)
			SET @Counter = @Counter + 1
		END

	INSERT INTO dbo.BookedTimesFinal (
			StartTime,
			EndTime )
	SELECT	
			StartTime,
			EndTime
	FROM	@StartAndEndOfDay
	UNION
	SELECT
			StartTime,
			EndTime

	FROM	dbo.BookedTimes
	
	SELECT
			BlockStart, 
			BlockEnd,
			TotalCount = COUNT(1)OVER()
	FROM (
		SELECT DISTINCT btf2.EndTime as BlockStart,
			(SELECT TOP 1	btf.StartTime
			FROM	[BookedTimesFinal] as btf
			WHERE	btf.StartTime > btf2.EndTime
			ORDER by btf.StartTime ASC )as BlockEnd
		FROM	[BookedTimesFinal] as btf2 ) as OpenBlocks
		WHERE	DateDiff(MINUTE, BlockStart, BlockEnd) >= @sessionDuration + @sessionPrepTime + @driveTime
				AND BlockStart > DATEADD(DAY, 13, GETUTCDATE())
				AND NOT EXISTS (
						SELECT	*
						FROM	dbo.BookedTimesFinal as btf
						WHERE	BlockStart = btf.StartTime
				)
		ORDER BY	BlockStart

		OFFSET @offset Rows
		Fetch Next @pageSize Rows ONLY

	TRUNCATE TABLE dbo.BookedTimesFinal;

END